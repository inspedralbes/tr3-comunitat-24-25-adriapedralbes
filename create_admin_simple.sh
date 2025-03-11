#!/bin/bash

echo "Creando superusuario admin en el contenedor Django..."

docker exec -it django-app python -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
try:
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@futurprive.com', 'admin123');
        print('Superusuario creado: admin / admin123');
    else:
        u = User.objects.get(username='admin');
        u.set_password('admin123');
        u.is_staff = True;
        u.is_superuser = True;
        u.save();
        print('Contraseña de administrador restablecida a: admin123');
except Exception as e:
    print(f'Error: {e}');
"

echo "Proceso completado. Intenta iniciar sesión nuevamente con usuario 'admin' y contraseña 'admin123'"
