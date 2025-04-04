"""
Configuración de CORS para el proyecto Django

Este script configura django-cors-headers para permitir solicitudes
desde el frontend (http://localhost:3000) al backend (http://localhost:8000).

Para usar:
1. Instalar django-cors-headers: pip install django-cors-headers
2. Incluir este archivo en settings.py: from .cors_config import *
"""

# Agregar 'corsheaders' a INSTALLED_APPS
INSTALLED_APPS_CORS = ['corsheaders']

# Agregar 'corsheaders.middleware.CorsMiddleware' al inicio de MIDDLEWARE
MIDDLEWARE_CORS = ['corsheaders.middleware.CorsMiddleware']

# Configurar orígenes permitidos
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Agregar aquí otros orígenes que necesites permitir
]

# Permitir credenciales (cookies, auth headers)
CORS_ALLOW_CREDENTIALS = True

# Permitir cabeceras específicas
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Permitir métodos específicos
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Asegura que la configuración sea para todos los endpoints de la API
CORS_URLS_REGEX = r'^/api/.*$'