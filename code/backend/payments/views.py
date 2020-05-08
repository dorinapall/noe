from urllib.parse import urlparse
from django.urls import resolve
from django.db import transaction
from rest_framework import viewsets
from rest_framework import generics
from rest_framework import status
from rest_framework import mixins
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from appointments.models import Appointment, QRCode
from appointments.auth import AppointmentAuthentication
from appointments.permissions import AppointmentPermission
from appointments import email
from .prices import calc_payments, PRODUCTS
from . import models as m
from . import serializers as s


class GetPriceView(generics.GenericAPIView):
    """Query the price of the Appointment.
    Get the Appointment ID in POST request body, so we don't leak it accidentally.
    """

    serializer_class = s.GetPriceSerializer
    authentication_classes = [AppointmentAuthentication]
    permission_classes = [AppointmentPermission]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment, product = serializer.save()
        self.check_object_permissions(self.request, appointment)

        _, summary = calc_payments(appointment.seats.all(), product)
        return Response(summary)


class PayAppointmentView(generics.GenericAPIView):
    """Called at the end of registration when user presses the Pay button."""

    serializer_class = s.PaySerializer
    authentication_classes = [AppointmentAuthentication]
    permission_classes = [AppointmentPermission]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment, product = serializer.save()
        self.check_object_permissions(self.request, appointment)

        if any(hasattr(s, "payment") for s in appointment.seats.all()):
            raise ValidationError({"appointment": "This appointment has payment already!"})
        if appointment.seats.count() == 0:
            raise ValidationError({"appointment": "This appointment has no persons yet!"})

        payments, summary = calc_payments(appointment.seats.all(), product)

        # This is just a sanity check, so we don't calculate a wrong amount.
        # What we show on the frontend, should always match on the backend.
        if summary["total_price"] != serializer.validated_data["total_price"]:
            raise ValidationError({"total_price": "Invalid amount!"})

        m.Payment.objects.bulk_create(payments)

        self._make_qrs(appointment.seats.all())
        # we need to refresh seats, because QR codes has been attached
        self._send_summaries(appointment.seats.all())

        # Appointment is done, when the payments are set.
        # This logic is moved from the frontend to here.
        # We consider appointments to be done even without
        # completed payments, including online incomplete payments.
        appointment.is_registration_completed = True
        appointment.save(update_fields=["is_registration_completed"])

        return Response(summary)

    def _make_qrs(self, seats):
        for seat in seats:
            QRCode.objects.create(seat=seat)

    def _send_summaries(self, seats):
        for seat in seats:
            if not seat.email:
                raise ValidationError({"email": "Email field is required"})
            email.send_qrcode(seat)
