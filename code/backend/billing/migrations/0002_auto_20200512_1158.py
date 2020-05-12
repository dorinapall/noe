# Generated by Django 3.0.5 on 2020-05-12 09:58

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('appointments', '0003_seat_doctor_name'),
        ('billing', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='billingdetail',
            name='appointment',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='billing_detail', to='appointments.Appointment'),
        ),
    ]
