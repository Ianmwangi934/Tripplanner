from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class GeneratedLog(models.Model):
    image = models.ImageField(upload_to='generated_logs/')
    created_at = models.DateTimeField(auto_now_add=True)

class Trip(models.Model):
    name = models.CharField(max_length=255)
    start_location = models.CharField(max_length=255)
    end_location = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class TripLog(models.Model):
    STATUS_CHOICE = [
        ("off-duty", "Off-duty"),
        ("on-duty", "On-duty"),
        ("driving", "Driving"),
        ("resting", "Resting"),
    ]
    
    trip = models.ForeignKey('Trip', on_delete=models.CASCADE, related_name='logs')
    timestamp = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICE, default="driving")
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.trip} - {self.status} at {self.timestamp}"

