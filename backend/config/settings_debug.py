"""
Archivo de configuración alternativo para depuración.
Para usarlo, ejecuta:
python manage.py runserver --settings=config.settings_debug
"""

from .settings import *

# Configuración de correo para depuración
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
