import pytest
from ..views import LoginView


@pytest.mark.django_db
def test_succesful_login(factory, api_user):
    req = factory.post("/staff-api/login/", {"username": api_user.username, "password": api_user.PASSWORD})
    login_view = LoginView.as_view()
    res = login_view(req)
    assert len(res.data["token"]) == 40
    assert res.data["location"] == "http://testserver/api/locations/1/"
    assert res.data["group"] == "seatgroup"
    assert res.data["qrcode_location_prefix"] == "0001"
