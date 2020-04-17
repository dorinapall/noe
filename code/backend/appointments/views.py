import logging
from django.core.mail import send_mail
from django.shortcuts import render, reverse
from rest_framework import viewsets
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view

from . import models as m
from . import serializers as s

logger = logging.getLogger(__name__)


class LocationViewSet(viewsets.ModelViewSet):
    queryset = m.Location.objects.all()
    serializer_class = s.LocationSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = m.Appointment.objects.all()
    serializer_class = s.AppointmentSerializer

    def perform_create(self, serializer):
        appointment = serializer.save()
        # FIXME: this is ugly, but works until we have only one email
        # for every appointment
        ev = appointment.email_verifications.first()
        token = ev.make_token()
        full_url = self.request.build_absolute_uri(reverse("verify-email"))
        verify_url = f"{full_url}?token={token}"
        logger.info("Sending verification email for %s", serializer.validated_data["email"])
        send_mail(
            "Email cím megerősítése áthajtásos koronavírus teszthez",
            f"Kérjük erősítse meg email címét: {verify_url}\nA linkre kattintva folytathatja a regisztrációt",
            "from@example.com",
            ["to@example.com"],
            fail_silently=False,
        )


class SeatViewSet(viewsets.ModelViewSet):
    queryset = m.Seat.objects.all()
    serializer_class = s.SeatSerializer


@api_view(http_method_names=["POST"])
def verify_email(request):
    return Response(
        {
            "appointment_url": "https://noe.rollet.app/api/appointments/asdfasdf-1231231-12312-12",
            "appointment_email": "user@rollet.app",
        }
    )
