#!/bin/bash
set -e

echo "🔵 Esperando a que la base de datos PostgreSQL esté disponible..."
while ! nc -z postgres 5432; do
  sleep 6
done
echo "✅ Base de datos PostgreSQL disponible"

# Realizar migraciones
echo "🔵 Aplicando migraciones..."
python manage.py makemigrations
python manage.py migrate

# Crear superusuario
echo "🔵 Configurando superusuario..."
python create_superuser.py

# Configurar sistema de gamificación
echo "Configurando sistema de gamificación..."

# Comprobar si debemos forzar la recreación completa
if [ "$FORCE_GAMIFICATION_SETUP" = "true" ]; then
  echo "Forzando recreación del sistema de gamificación..."
  python manage.py setup_gamification --force || echo "No se pudo configurar el sistema de gamificación, continuando..."
else
  python manage.py setup_gamification || echo "No se pudo configurar el sistema de gamificación, continuando..."
fi

# Recopilar archivos estáticos
echo "🔵 Recopilando archivos estáticos..."
python manage.py collectstatic --noinput

echo "✅ Inicialización completada"

# Iniciar el servidor con timeout extendido
echo "🚀 Iniciando el servidor Django con timeout extendido..."
gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --timeout ${GUNICORN_TIMEOUT:-120} \
  --workers 3
