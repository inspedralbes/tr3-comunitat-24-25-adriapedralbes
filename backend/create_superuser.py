
"""
Script para crear un superusuario Django usando variables de entorno.
Este script debe ejecutarse después de que las migraciones se hayan aplicado.
"""
import os
import django
import sys

# Configurar el entorno Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Importar el modelo de usuario
from django.contrib.auth import get_user_model
User = get_user_model()

def create_superuser():
    """
    Crea o actualiza un superusuario basado en variables de entorno.
    """
    # Obtener credenciales de las variables de entorno
    username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
    email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
    password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
    
    # Verificar que todas las variables necesarias están definidas
    if not all([username, email, password]):
        print("Error: Las variables DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_EMAIL, "
              "y DJANGO_SUPERUSER_PASSWORD deben estar definidas.")
        return
    
    try:
        # Verificar si el usuario ya existe
        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            user.email = email
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.save()
            print(f"[+] Superusuario '{username}' actualizado exitosamente")
        else:
            User.objects.create_superuser(username=username, email=email, password=password)
            print(f"[+] Superusuario '{username}' creado exitosamente")
    except Exception as e:
        print(f"[!] Error al crear/actualizar superusuario: {e}")

if __name__ == "__main__":
    create_superuser()
