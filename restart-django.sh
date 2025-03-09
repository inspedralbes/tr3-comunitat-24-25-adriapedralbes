#!/bin/bash

# Script para reiniciar Django después de cambios

echo "Reiniciando servicio de Django..."
docker compose -f docker-compose.prod.yml restart django

echo "Esperando a que Django se inicie completamente..."
sleep 5

echo "Mostrando los últimos logs:"
docker compose -f docker-compose.prod.yml logs --tail=30 django

echo "
Puedes probar la API en https://api.futurprive.com"
echo "El diagnóstico de correo está disponible en https://api.futurprive.com/api/test/email/"
echo "La base de datos ahora es accesible en https://db.futurprive.com"