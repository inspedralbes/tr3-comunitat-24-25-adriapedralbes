"""
Configuración de correo electrónico para el proyecto.
Este archivo se utiliza para sobreescribir la configuración de correo en producción.
"""

import os

# Obtener las variables de entorno
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'mail.privateemail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 465))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'False') == 'True'
EMAIL_USE_SSL = os.environ.get('EMAIL_USE_SSL', 'True') == 'True'
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', 'adria@futurprive.com')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER)
EMAIL_TIMEOUT = int(os.environ.get('EMAIL_TIMEOUT', 30))
SERVER_EMAIL = os.environ.get('SERVER_EMAIL', EMAIL_HOST_USER)
