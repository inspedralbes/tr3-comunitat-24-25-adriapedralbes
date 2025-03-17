"""
Configuraciones de seguridad para el proyecto Django
Este archivo contiene las configuraciones específicas de seguridad
"""

# Importar la variable DEBUG desde la configuración principal
import os

# En producción, siempre forzar DEBUG=False
DEBUG = False

# Django Axes (Protección contra fuerza bruta)
# -----------------------------------------------------
AXES_FAILURE_LIMIT = 5  # Número de intentos fallidos antes de bloqueo
AXES_COOLOFF_TIME = 1  # Tiempo de bloqueo en horas
AXES_LOCKOUT_TEMPLATE = 'admin/lockout.html'  # Template para mostrar durante bloqueo
AXES_USE_USER_AGENT = True  # Considerar el user agent para el bloqueo
AXES_LOCK_OUT_BY_COMBINATION_USER_AND_IP = True  # Bloquear por combinación de usuario e IP
AXES_RESET_ON_SUCCESS = True  # Resetear contador de intentos al iniciar sesión con éxito
AXES_BEHIND_REVERSE_PROXY = True  # Si está detrás de un proxy como Traefik

# Content Security Policy
# -----------------------------------------------------
CSP_DEFAULT_SRC = ("'self'",)
CSP_STYLE_SRC = ("'self'", "'unsafe-inline'")  # Permitir estilos inline (para admin)
CSP_SCRIPT_SRC = ("'self'", "'unsafe-inline'", "'unsafe-eval'")  # Para admin
CSP_IMG_SRC = ("'self'", "data:")  # Permitir imágenes data: URI
CSP_FONT_SRC = ("'self'",)

# Rate Limiting
# -----------------------------------------------------
RATELIMIT_VIEW = 'ratelimited'

# Headers de seguridad adicionales
# -----------------------------------------------------
SECURE_HSTS_SECONDS = 31536000  # 1 año
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'  # Evitar clickjacking

# Configuración adicional de seguridad para producción
if not DEBUG:
    # Forzar HTTPS
    SECURE_SSL_REDIRECT = True
    
    # Limitar el número máximo de parámetros en solicitudes (protección contra DDoS)
    DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000
