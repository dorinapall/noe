import uuid

from django.db import models
from django.utils.translation import gettext_lazy as _


class Bill(models.Model):
    BILL_TYPE_RECEIPT = "RECEIPT"
    BILL_TYPE_VAT_INVOICE = "VAT_INVOICE"
    BILL_TYPE_CHOICES = (
        (BILL_TYPE_RECEIPT, _("receipt")),
        (BILL_TYPE_VAT_INVOICE, _("VAT invoice")),
    )
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.ForeignKey(
        "appointments.Appointment", on_delete=models.SET_NULL, null=True
    )
    payment = models.ForeignKey(
        "payments.Payment", on_delete=models.SET_NULL, null=True
    )
    bill_id = models.CharField(max_length=255, default="")
    bill_type = models.CharField(max_length=255, choices=BILL_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("created_at",)