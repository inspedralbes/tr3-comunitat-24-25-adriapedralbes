import os
import django

# Configurar entorno Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import User

# Verificar si ya existe un superusuario
if not User.objects.filter(is_superuser=True).exists():
    # Crear superusuario
    User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123',
        first_name='Admin',
        last_name='User'
    )
    print('Superusuario creado exitosamente')
else:
    print('Ya existe un superusuario')
