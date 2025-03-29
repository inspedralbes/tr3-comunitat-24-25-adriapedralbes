#!/bin/bash

echo "Recargando datos del calendario..."

# Cambiar al directorio del proyecto
cd /home/adria/tr3-comunitat-24-25-adriapedralbes/backend

# Ejecutar el comando de Django
python manage.py load_events

echo "Datos del calendario recargados exitosamente!"
