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
            r'^/admin/',          # Panel de administración (honeypot)
            r'^/backend-admin/',   # Panel de administración real
            r'^/api/token/',      # Obtención de tokens
            r'^/api/auth/register/',  # Registro de nuevos usuarios
            r'^/api/newsletter/', # Suscripción al newsletter
            r'^/api/',            # Temporalmente hacer públicas todas las rutas API para debugging
            r'^/ratelimited/',    # Página de rate limiting
            r'^/accounts/locked/', # Página de bloqueo
            # Añade aquí otras rutas públicas que necesites
        ]

    def __call__(self, request):
        # Temporalmente desactivamos las restricciones para debugging
        # if not settings.DEBUG:
        if False:
            # Verificar si la ruta es de la API y no es una excepción
            path = request.path
            is_api_route = path.startswith('/api/')
            is_public_route = any(re.match(pattern, path) for pattern in self.public_url_patterns)
            
            # Si es una ruta de API, no es pública, y el usuario no está autenticado
            if is_api_route and not is_public_route and not request.user.is_authenticated:
                # Si es una solicitud a la raíz de la API, redirigir al admin
                if path == '/api/' or path == '/api':
                    return redirect('/backend-admin/')
            
            # Si es la raíz del sitio y el usuario no está autenticado, redirigir al admin
            if path == '/' and not request.user.is_authenticated:
                return redirect('/backend-admin/')

        # Continuar con el flujo normal para rutas autenticadas o exentas
        response = self.get_response(request)
        return response
