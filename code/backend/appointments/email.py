import logging
from urllib.parse import urlencode, urljoin
from django.conf import settings
from django.shortcuts import render
from django.core.mail import send_mail, EmailMessage
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)

EMAIL_CONFIRMATION_PATH = "email-megerosites/"


def send_verification(token, address):
    url_qs = urlencode({"token": token})
    verify_url = urljoin(settings.FRONTEND_URL, f"{EMAIL_CONFIRMATION_PATH}?{url_qs}")
    logger.info("Sending verification email to %s", address)
    send_mail(
        "Email cím megerősítése áthajtásos koronavírus teszthez",
        f"Kérjük erősítse meg email címét: {verify_url}\nA linkre kattintva folytathatja a regisztrációt",
        settings.DEFAULT_FROM_EMAIL,
        [address],
        fail_silently=False,
    )


def send_summary(appointment, png_image, address):
    context = {"appointment": appointment, "seats": appointment.seats.all()}
    body = render_to_string("summary.txt", context)

    email = EmailMessage(
        subject="Regisztráció megerősítése",
        body=body,
        to=[address],
        attachments=[("koronavirus_azonosito.png", png_image)],
    )
    email.send()
