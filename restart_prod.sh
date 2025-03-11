#!/bin/bash
# Hacer el script ejecutable
chmod +x $0

# Script para reiniciar los servicios en producción
echo "🔵 Deteniendo los contenedores..."
docker compose -f docker-compose.prod.yml down

echo "🔵 Construyendo y levantando los contenedores..."
docker compose -f docker-compose.prod.yml up -d --build

echo "✅ Servicios reiniciados. Comprueba los logs para verificar la creación del superusuario:"
echo "   docker logs django-app"

echo "🔑 Si necesitas crear manualmente un superusuario, ejecuta:"
echo "   docker exec -it django-app python create_superuser.py"
