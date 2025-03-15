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

# Crear superusuario si no existe
echo "Creando superusuario..."
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
echo "Recopilando archivos estáticos..."
python manage.py collectstatic --noinput --clear --verbosity 0

# Iniciar el servidor
echo "Iniciando servidor..."
python manage.py runserver 0.0.0.0:8000
