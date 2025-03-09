#!/bin/bash

# Script para reiniciar Django después de cambios

echo "Reiniciando servicio de Django..."
docker-compose -f docker-compose.prod.yml restart django

echo "Esperando a que Django se inicie completamente..."
sleep 5

echo "Mostrando los últimos logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20 django