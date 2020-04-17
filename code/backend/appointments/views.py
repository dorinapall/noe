import logging
from django.core.mail import send_mail
from django.shortcuts import render, reverse
from rest_framework import viewsets
from rest_framework import status
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.decorators import api_view

from . import models as m
from . import serializers as s

logger = logging.getLogger(__name__)


class LocationViewSet(viewsets.ModelViewSet):
    queryset = m.Location.objects.all()
    serializer_class = s.LocationSerializer


def _send_verification_email(request, email_verification, email):
    token = email_verification.make_token()
    full_url = request.build_absolute_uri(reverse("verify-email"))
    verify_url = f"{full_url}?token={token}"
    logger.info("Sending verification email for %s", email)
    send_mail(
        "Email cím megerősítése áthajtásos koronavírus teszthez",
        f"Kérjük erősítse meg email címét: {verify_url}\nA linkre kattintva folytathatja a regisztrációt",
        "from@example.com",
        ["to@example.com"],
        fail_silently=False,
    )


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = m.Appointment.objects.all()
    serializer_class = s.AppointmentSerializer

    def perform_create(self, serializer):
        appointment = serializer.save()
        # FIXME: this is ugly, but works until we have only one email
        # for every appointment
        ev = appointment.email_verifications.first()
        _send_verification_email(self.request, ev, serializer.validated_data["email"])


class SeatViewSet(viewsets.ModelViewSet):
    queryset = m.Seat.objects.all()
    serializer_class = s.SeatSerializer


class VerifyEmailView(generics.GenericAPIView):
    serializer_class = s.VerifyEmailSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK,)


class ResendVerifyEmailView(generics.CreateAPIView):
    serializer_class = s.ResendEmailVerificationSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ev = m.EmailVerification.objects.get(pk=serializer.validated_data["uuid"])
        email = ev.appointment.email
        _send_verification_email(self.request, ev, email)
        return Response({"success": True, "email": email})
