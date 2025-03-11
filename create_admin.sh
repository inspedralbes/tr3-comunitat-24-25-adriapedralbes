#!/bin/bash

# Ejecutar el script Python dentro del contenedor de Django
docker exec -it django-app python /app/create_superuser.py

echo "¡Proceso completado! Ahora deberías poder iniciar sesión con usuario 'admin' y contraseña 'admin123'"
