from django.db import models

# Create your models here.
class GeneratedLog(models.Model):
    image = models.ImageField(upload_to='generated_logs/')
    created_at = models.DateTimeField(auto_now_add=True)
