#!/bin/bash

echo "🔵 Deteniendo servicios actuales..."
docker compose -f docker-compose.prod.yml down

echo "🔵 Eliminando volúmenes estáticos para regenerarlos..."
docker volume rm tr3-comunitat-24-25-adriapedralbes_static_data || true

echo "🔵 Verificando directorio para configuración de Traefik..."
mkdir -p ./traefik/config

echo "🔵 Eliminando contenedores antiguos de Django..."
docker rm -f django-app || true

echo "🔵 Reconstruyendo servicios..."
docker compose -f docker-compose.prod.yml up -d --build

echo "⏳ Esperando a que los servicios se inicien (15 segundos)..."
sleep 15

echo "🔵 Verificando el estado de los servicios..."
docker ps

echo "🔵 Verificando logs de Django para errores..."
docker logs django-app | grep -i "error" | tail -n 20

echo "🔵 Verificando logs completos de Django..."
docker logs django-app | tail -n 50

echo "✅ Proceso completado. Los servicios deberían estar funcionando ahora."
echo "   Accede a tu aplicación en: https://futurprive.com"
echo "   La API debería estar disponible en: https://api.futurprive.com"
echo "   El panel de administración está en: https://api.futurprive.com/admin/"
echo ""
echo "🔑 Credenciales de administrador:"
echo "   Usuario: adriaestevezfuturprive"
echo "   Contraseña: [La definida en el archivo .env]"