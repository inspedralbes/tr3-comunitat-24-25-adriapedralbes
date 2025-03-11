
"""
Script para crear un superusuario Django usando variables de entorno.

Este script lee las variables DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_EMAIL,
y DJANGO_SUPERUSER_PASSWORD del archivo .env y crea o actualiza un superusuario
con esas credenciales.
"""
import os
import django
import sys
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configurar el entorno Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Importar el modelo de usuario
from django.contrib.auth import get_user_model
User = get_user_model()

def setup_admin_user():
    """
    Crea o actualiza un superusuario basado en variables de entorno.
    """
    # Obtener credenciales de las variables de entorno
    username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
    email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
    password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
    
    # Verificar que todas las variables necesarias están definidas
    if not all([username, email, password]):
        print("Error: Las variables de entorno DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_EMAIL, "
              "y DJANGO_SUPERUSER_PASSWORD deben estar definidas en el archivo .env")
        sys.exit(1)
    
    # Verificar si el usuario ya existe
    user_exists = User.objects.filter(username=username).exists()
    
    if user_exists:
        # Actualizar el usuario existente
        user = User.objects.get(username=username)
        user.email = email
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"Usuario administrador '{username}' actualizado correctamente.")
    else:
        # Crear un nuevo usuario
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f"Usuario administrador '{username}' creado correctamente.")
    
    print(f"\nPuedes acceder al panel de administración con:")
    print(f"  - Usuario: {username}")
    print(f"  - Contraseña: {'*' * len(password)}")
    print(f"  - URL: https://api.futurprive.com/admin/\n")

if __name__ == "__main__":
    try:
        setup_admin_user()
    except Exception as e:
        print(f"Error durante la creación/actualización del administrador: {e}")
        sys.exit(1)
