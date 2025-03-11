#!/bin/bash
set -e

echo "🔵 Esperando a que la base de datos PostgreSQL esté disponible..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "✅ Base de datos PostgreSQL disponible"

# Realizar migraciones
echo "🔵 Aplicando migraciones..."
python manage.py makemigrations
python manage.py migrate

# Crear superusuario
echo "🔵 Configurando superusuario..."
python create_superuser.py

# Recopilar archivos estáticos
echo "🔵 Recopilando archivos estáticos..."
python manage.py collectstatic --noinput

echo "✅ Inicialización completada"

# Iniciar el servidor
echo "🚀 Iniciando el servidor Django..."
gunicorn config.wsgi:application --bind 0.0.0.0:8000
