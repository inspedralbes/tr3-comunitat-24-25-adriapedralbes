#!/bin/bash

# Script para reconstruir completamente el contenedor de Django

echo "Deteniendo el servicio de Django..."
docker compose -f docker-compose.prod.yml stop django

echo "Eliminando el contenedor de Django..."
docker compose -f docker-compose.prod.yml rm -f django

echo "Reconstruyendo el contenedor de Django..."
docker compose -f docker-compose.prod.yml build django

echo "Iniciando el nuevo contenedor de Django..."
docker compose -f docker-compose.prod.yml up -d django

echo "Esperando a que Django se inicie completamente..."
sleep 10

echo "Mostrando los últimos logs:"
docker compose -f docker-compose.prod.yml logs --tail=50 django

echo "
Puedes probar la API en https://api.futurprive.com"
echo "El diagnóstico de correo está disponible en https://api.futurprive.com/api/test/email/"
echo "La base de datos es accesible en https://db.futurprive.com"
