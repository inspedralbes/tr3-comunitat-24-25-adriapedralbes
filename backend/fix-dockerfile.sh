#!/bin/bash

# Este script arregla el problema con redirect_to_api en config/urls.py

# Asegúrate de que el archivo urls.py tenga la función y la importación adecuada
if ! grep -q "def redirect_to_api" config/urls.py; then
  echo "Arreglando config/urls.py..."
  
  # Crear un archivo de respaldo
  cp config/urls.py config/urls.py.bak
  
  # Añadir la importación y función si no están presentes
  sed -i '/from django.conf.urls.static import static/a from django.shortcuts import redirect\n\ndef redirect_to_api(request):\n    return redirect("api/")' config/urls.py
  
  echo "Archivo urls.py actualizado."
else
  echo "El archivo urls.py ya parece tener la función redirect_to_api."
fi

echo "Proceso completado. Puedes ejecutar: docker compose -f docker-compose.prod.yml up --build"
