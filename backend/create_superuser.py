import os
import django

# Configurar entorno Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import User

# Intentar obtener las credenciales de superusuario desde variables de entorno
username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123')
# Verificar si se debe forzar la creación del superusuario
force_create = os.environ.get('FORCE_SUPERUSER_CREATE', '').lower() == 'true'

# Mostrar información de diagnóstico
print(f"\n🔵 Configurando superusuario con:")
print(f"   - Username: {username}")
print(f"   - Email: {email}")
print(f"   - Force create: {force_create}\n")

# Verificar si ya existe un superusuario o si se debe forzar la creación
if not User.objects.filter(is_superuser=True).exists() or force_create:
    # Crear superusuario
    User.objects.create_superuser(
        username=username,
        email=email,
        password=password,
        first_name='Admin',
        last_name='User'
    )
    print(f'Superusuario {username} creado exitosamente')
else:
    # Esto es útil para depuración, verifica si hay algún superusuario existente
    superusers = User.objects.filter(is_superuser=True)
    print(f'Ya existen {superusers.count()} superusuarios:')
    for user in superusers:
        print(f' - {user.username} ({user.email})')
