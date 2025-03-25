import os
import django
from datetime import datetime, timedelta

# Configurar entorno Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import User

# Obtener las credenciales de superusuario desde variables de entorno
username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

# Verificar que todas las credenciales estén definidas
if not (username and email and password):
    print("\n❌ ERROR: No se han definido todas las variables de entorno necesarias")
    print("   Se requieren DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_EMAIL y DJANGO_SUPERUSER_PASSWORD")
    print("   No se creará ningún superusuario con credenciales predeterminadas.\n")
    exit(1)
# Verificar si se debe forzar la creación del superusuario
force_create = os.environ.get('FORCE_SUPERUSER_CREATE', '').lower() == 'true'

# Mostrar información de diagnóstico
print(f"\n🔵 Configurando superusuario con:")
print(f"   - Username: {username}")
print(f"   - Email: {email}")
print(f"   - Force create: {force_create}\n")

# Eliminar cualquier superusuario con credenciales predeterminadas
default_admins = User.objects.filter(username='admin', email='admin@example.com', is_superuser=True)
if default_admins.exists():
    count = default_admins.count()
    default_admins.delete()
    print(f"\n❗ Se han eliminado {count} superusuarios con credenciales predeterminadas")

# Verificar si ya existe un usuario con el mismo nombre de usuario
existing_user = User.objects.filter(username=username).first()

if existing_user:
    # Si el usuario existe pero no es superusuario, actualizar sus permisos
    if not existing_user.is_superuser or not existing_user.is_staff:
        print(f"\n🔵 El usuario {username} ya existe. Actualizando permisos a superusuario.")
        existing_user.is_superuser = True
        existing_user.is_staff = True
        existing_user.save()
        print(f"\n✅ Usuario {username} actualizado con permisos de superusuario.")
    else:
        print(f"\n🔵 El usuario {username} ya existe y ya tiene permisos de superusuario.")
# Si el usuario no existe o se debe forzar la creación con otro nombre
elif not User.objects.filter(is_superuser=True).exists() or force_create:
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
