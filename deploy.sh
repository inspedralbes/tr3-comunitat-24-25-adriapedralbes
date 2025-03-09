#!/bin/bash

# Script para desplegar el proyecto en producción

echo "Iniciando despliegue de Futurprive..."

# Asegurar que los scripts sean ejecutables
chmod +x ./reset-ssl.sh

# Asegurar que el archivo acme.json tenga los permisos adecuados
chmod 600 ./traefik/acme.json

# Detener contenedores previos si existen
docker-compose -f docker-compose.prod.yml down

# Eliminar volúmenes anteriores (descomentar si deseas empezar desde cero)
# docker volume rm $(docker volume ls -q | grep futurprive) 2>/dev/null

# Construir y levantar los contenedores
docker-compose -f docker-compose.prod.yml up -d --build

echo "Despliegue completado."
echo "La aplicación debería estar disponible en https://futurprive.com"
echo "La API debería estar disponible en https://api.futurprive.com"