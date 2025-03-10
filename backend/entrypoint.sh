#!/bin/bash

# Esperar a que la base de datos esté disponible
echo "Esperando por la base de datos..."
sleep 5

echo "Realizando migraciones..."
# Eliminar cualquier migración existente (solo en desarrollo)
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete

# Hacer migraciones y migrar
python manage.py makemigrations api
python manage.py migrate

# Cargar datos iniciales (tema del admin)
echo "Cargando datos iniciales..."
python manage.py loaddata api/fixtures/admin_interface_theme_devaccelerator.json

# Crear superusuario si no existe
echo "Creando superusuario..."
python create_superuser.py

# Recopilar archivos estáticos
echo "Recopilando archivos estáticos..."
python manage.py collectstatic --noinput

# Iniciar el servidor
echo "Iniciando servidor..."
python manage.py runserver 0.0.0.0:8000
