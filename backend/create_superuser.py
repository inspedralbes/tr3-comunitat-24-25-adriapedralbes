
import os
import django

# Configurar el entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Importar el modelo de usuario después de configurar Django
from django.contrib.auth import get_user_model

User = get_user_model()

# Crear superusuario si no existe
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@futurprive.com', 'admin123')
    print("Superusuario creado: admin / admin123")
else:
    print("El superusuario 'admin' ya existe. Restableciendo la contraseña...")
    admin_user = User.objects.get(username='admin')
    admin_user.set_password('admin123')
    admin_user.save()
    print("Contraseña restablecida para 'admin'")
