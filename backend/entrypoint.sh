#!/bin/bash

# Función para esperar a que la base de datos esté disponible
wait_for_db() {
  echo "Esperando por la base de datos..."
  
  # Comprobar si estamos usando PostgreSQL
  if [ "$DATABASE_ENGINE" = "django.db.backends.postgresql" ]; then
    # Esperar a que PostgreSQL esté disponible
    until pg_isready -h "$DATABASE_HOST" -p "$DATABASE_PORT" -U "$DATABASE_USER"; do
      echo "PostgreSQL no está listo todavía - durmiendo"
      sleep 1
    done
    echo "PostgreSQL está listo!"
  else
    # Para SQLite no necesitamos esperar
    echo "Usando SQLite, no es necesario esperar por la base de datos"
  fi
}

# Esperar a que la base de datos esté disponible
wait_for_db

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

# Configurar Stripe (crear producto y precio si no existen)
echo "Configurando Stripe..."
python initialize_stripe.py || echo "No se pudo inicializar Stripe, continuando..."

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
