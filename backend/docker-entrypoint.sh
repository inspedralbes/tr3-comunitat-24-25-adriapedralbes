#!/bin/bash
set -e

# Configurar STATIC_ROOT si no está presente
if ! grep -q "STATIC_ROOT" */settings.py; then
  # Buscar archivo de settings.py
  SETTINGS_FILE=$(find . -name "settings.py" | grep -v "venv" | head -1)
  echo -e "\n# Static files settings for production\nSTATIC_ROOT = \"\$(BASE_DIR) / \"staticfiles\"\n" >> $SETTINGS_FILE
  mkdir -p staticfiles
fi

# Ejecutar collectstatic
python manage.py collectstatic --noinput

# Migrar base de datos
python manage.py migrate

# Crear superusuario solo si se proporcionan variables de entorno
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ] && [ -n "$DJANGO_SUPERUSER_EMAIL" ]; then
  echo "Configurando superusuario desde variables de entorno..."
  python -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists():
    User.objects.create_superuser('$DJANGO_SUPERUSER_USERNAME', '$DJANGO_SUPERUSER_EMAIL', '$DJANGO_SUPERUSER_PASSWORD');
    print('Superusuario creado desde variables de entorno');
else:
    user = User.objects.get(username='$DJANGO_SUPERUSER_USERNAME');
    user.set_password('$DJANGO_SUPERUSER_PASSWORD');
    user.email = '$DJANGO_SUPERUSER_EMAIL';
    user.is_superuser = True;
    user.is_staff = True;
    user.save();
    print('Superusuario actualizado desde variables de entorno');
  "
fi

# Obtener el nombre del proyecto y ejecutar gunicorn
PROJECT_NAME=$(find . -type f -name "wsgi.py" | grep -v "venv" | head -1 | xargs dirname | xargs basename)
exec gunicorn --bind 0.0.0.0:8000 ${PROJECT_NAME}.wsgi:application
