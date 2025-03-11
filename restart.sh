#!/bin/bash

# Detener y eliminar los contenedores si existen
echo "Deteniendo y eliminando contenedores existentes..."
docker compose down

# Limpiar caché
echo "Limpiando caché de Next.js..."
sudo rm -rf frontend/.next/cache

# Asegurarse de que el archivo .env.local existe
echo "Configurando variables de entorno para Next.js..."
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api" > frontend/.env.local
echo "NEXT_PUBLIC_MEDIA_URL=http://127.0.0.1:8000/media" >> frontend/.env.local

# Reconstruir y reiniciar los contenedores
echo "Reconstruyendo y reiniciando los contenedores..."
docker compose up --build
