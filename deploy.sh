#!/bin/bash

# Script para desplegar el proyecto en producción

echo "Iniciando despliegue de Futurprive..."

# Verificar si los archivos de entorno existen
if [ ! -f ".env.prod" ]; then
    echo "Error: El archivo .env.prod no existe."
    echo "Por favor, crea este archivo a partir del ejemplo .env.prod.example con tus credenciales reales."
    exit 1
fi

# Asegurar que los scripts sean ejecutables
chmod +x ./reset-ssl.sh
chmod +x ./check-django.sh
chmod +x ./restart-django.sh
chmod +x ./rebuild-django.sh
chmod +x ./test-email.sh
chmod +x ./fix-all.sh
chmod +x ./fix-cors.sh

# Asegurar que el archivo acme.json tenga los permisos adecuados
chmod 600 ./traefik/acme.json

# Detener contenedores previos si existen
docker compose -f docker-compose.prod.yml down

# Eliminar volúmenes anteriores (descomentar si deseas empezar desde cero)
# docker volume rm $(docker volume ls -q | grep futurprive) 2>/dev/null

# Construir y levantar los contenedores
docker compose -f docker-compose.prod.yml up -d --build

# Esperar a que la base de datos se inicie completamente
echo "Esperando a que PostgreSQL se inicie..."
sleep 15

# Reiniciar el servicio de Django
echo "Reiniciando servicio de Django..."
docker compose -f docker-compose.prod.yml restart django

echo "Despliegue completado."
echo "La aplicación debería estar disponible en https://futurprive.com"
echo "La API debería estar disponible en https://api.futurprive.com"