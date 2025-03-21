import os
import django
from datetime import datetime, timedelta

# Configurar entorno Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import User

# Verificar si ya existe un superusuario
if not User.objects.filter(is_superuser=True).exists():
    # Crear superusuario
    admin = User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123',
        first_name='Admin',
        last_name='User'
    )
    
    # Hacer al superusuario premium automáticamente
    admin.is_premium = True
    admin.has_active_subscription = True
    admin.subscription_status = 'active'
    admin.subscription_start_date = datetime.now()
    admin.subscription_end_date = datetime.now() + timedelta(days=365)  # Fecha de expiración a un año
    admin.save()
    
    print('Superusuario creado exitosamente con acceso premium')
else:
    # Verificar si el superusuario existente ya es premium
    admin = User.objects.filter(is_superuser=True).first()
    if not admin.is_premium or not admin.has_active_subscription:
        admin.is_premium = True
        admin.has_active_subscription = True
        admin.subscription_status = 'active'
        admin.subscription_start_date = datetime.now()
        admin.subscription_end_date = datetime.now() + timedelta(days=365)  # Fecha de expiración a un año
        admin.save()
        print('Superusuario existente actualizado con acceso premium')
    else:
        print('Ya existe un superusuario con acceso premium')
