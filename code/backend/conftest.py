from pathlib import Path
import datetime as dt
from django.conf import settings
from django.contrib.auth.models import Group, Permission
from django.utils import timezone
from rest_framework.test import APIRequestFactory, APIClient
from rest_framework.authtoken.models import Token
import pytest
from appointments.models import Location, Appointment, Seat, QRCode, EmailVerification
from payments.models import Payment
from users.models import User


@pytest.fixture
def factory():
    return APIRequestFactory()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def appointment_client(appointment):
    ev = EmailVerification.objects.create(appointment=appointment, verified_at=timezone.now())
    token = ev.make_token()

    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Apptoken {token}")
    return client


@pytest.fixture
def appointment_client2():
    appointment = Appointment.objects.create()
    ev = EmailVerification.objects.create(appointment=appointment, verified_at=timezone.now())
    token = ev.make_token()

    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Apptoken {token}")
    return client


@pytest.fixture
def api_user():
    group = Group.objects.create(name="seatgroup")
    p = Permission.objects.get(codename="view_seat")
    l = Location.objects.create(name="Test Location")
    group.permissions.add(p)
    user = User(username="testuser", is_admin=True, location=l)
    user.PASSWORD = "testpassword"
    user.set_password(user.PASSWORD)
    user.save()
    user.groups.add(group)
    return user


@pytest.fixture
def staff_api_client(api_user, api_client):
    token = Token.objects.create(user=api_user)
    api_client.credentials(HTTP_AUTHORIZATION="Token " + token.key)
    return api_client


@pytest.fixture
def location_no_db():
    return Location()


@pytest.fixture
def location():
    return Location.objects.create()


@pytest.fixture
def location2():
    return Location.objects.create()


@pytest.fixture
def appointment():
    return Appointment.objects.create()


@pytest.fixture
def seat(appointment):
    return Seat.objects.create(birth_date=dt.date(1990, 6, 14), appointment=appointment)


@pytest.fixture
def seat2(appointment):
    return Seat.objects.create(birth_date=dt.date(1990, 6, 14), appointment=appointment)


@pytest.fixture
def payment(seat):
    return Payment.objects.create(seat=seat, amount=10_000)


@pytest.fixture
def qr(seat):
    return QRCode.objects.create(seat=seat)


@pytest.fixture
def datadir(request):
    return Path(request.fspath.dirname) / "data"
