import datetime as dt

import pytest
from rest_framework.reverse import reverse
from rest_framework import status

from appointments import models as m


@pytest.mark.django_db
def test_licence_plate_normalization(api_client, appointment):
    rv = api_client.patch(reverse("appointment-detail", kwargs={"pk": appointment.pk}), {"licence_plate": "abc-123"})
    assert rv.status_code == status.HTTP_200_OK
    assert rv.data["normalized_licence_plate"] == "ABC123"
    appointment.refresh_from_db()
    assert appointment.normalized_licence_plate == "ABC123"


@pytest.mark.django_db
def test_max_seat_for_appointments(api_client, appointment):
    seats = []
    for i in range(m.MAX_SEATS_PER_APPOINTMENT):
        seats.append(
            m.Seat(
                appointment=appointment,
                full_name=f"Seat #{i+1}",
                birth_date=dt.date(2020, 1, 1),
                identity_card_number="123123",
                post_code="asd",
                city="asd",
                address_line1="asd",
                email="asd@asd.com",
            )
        )
    m.Seat.objects.bulk_create(seats)

    rv = api_client.post(
        reverse("seat-list"),
        {
            "appointment": reverse("appointment-detail", kwargs={"pk": appointment.pk}),
            "full_name": "Full Name",
            "birth_date": "1990-06-14",
            "post_code": "1234",
            "city": "Budapest",
            "address_line1": "Alpha street 8.",
            "identity_card_number": "123456AB",
            "email": "asd@asd.com",
        },
    )
    assert rv.status_code == status.HTTP_400_BAD_REQUEST
    assert rv.data["appointment"] == [f"Maximum {m.MAX_SEATS_PER_APPOINTMENT} fő tartozhat egy foglaláshoz"]


def test_max_seats_per_appointment_count():
    assert m.MAX_SEATS_PER_APPOINTMENT == 5
