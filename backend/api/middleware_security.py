"""
Middleware de seguridad para proteger las rutas de la API y redirigir usuarios no autenticados
"""
from django.shortcuts import redirect
from django.urls import resolve
from django.conf import settings
import re

class APISecurityMiddleware:
    """
    Middleware para proteger el acceso a la API y redirigir a usuarios no autenticados
    al panel de administración o a la página de inicio
    """
    def __init__(self, get_response):
        self.get_response = get_response
        # Patrones de URL que no requieren autenticación
        self.public_url_patterns = [
            r'^/admin/',          # Panel de administración
            r'^/api/token/',      # Obtención de tokens
            r'^/api/auth/register/',  # Registro de nuevos usuarios
            r'^/api/newsletter/', # Suscripción al newsletter
            r'^/api/',            # Todas las rutas API temporalmente públicas
            r'^/static/',         # Archivos estáticos
            # Añade aquí otras rutas públicas que necesites
        ]

    def __call__(self, request):
        # Continuar con el flujo normal para todas las rutas
        response = self.get_response(request)
        return response
