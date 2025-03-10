from django.db import models
import uuid

class Subscriber(models.Model):
    """
    Modelo para almacenar los suscriptores de la newsletter.
    """
    name = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True)
    confirmation_token = models.UUIDField(default=uuid.uuid4, editable=False)
    confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Suscriptor'
        verbose_name_plural = 'Suscriptores'
    
    def __str__(self):
        return self.email
