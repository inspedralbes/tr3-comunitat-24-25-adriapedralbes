#!/bin/bash
# Hacer el script ejecutable
chmod +x $0

# Asegurarnos de que DEBUG está en False para producción
echo "🔵 Verificando configuración de DEBUG en .env..."
if grep -q "DEBUG=True" ./backend/.env; then
    echo "❌ Se detectó DEBUG=True en producción. Cambiando a False..."
    sed -i 's/DEBUG=True/DEBUG=False/g' ./backend/.env
    echo "✅ DEBUG establecido en False para entorno de producción"
fi
echo "🔵 Deteniendo los contenedores..."
docker compose -f docker-compose.prod.yml down

echo "🔵 Construyendo y levantando los contenedores..."
docker compose -f docker-compose.prod.yml up -d --build

echo "✅ Servicios reiniciados. Comprueba los logs para verificar la creación del superusuario:"
echo "   docker logs django-app"

echo "🔐 Recordatorio importante: La URL del admin ahora es /backend-admin/"
echo "   admin/ es una trampa para atacantes"

echo "🔑 Si necesitas crear manualmente un superusuario, ejecuta:"
echo "   docker exec -it django-app python create_superuser.py"
