#!/bin/bash

# Script para configurar el entorno de producción

# Crear red de Docker
echo "Creando red de Docker..."
docker network create web || true

# Crear directorios necesarios
echo "Creando directorios..."
mkdir -p traefik/config traefik/logs nginx/conf

# Crear archivo acme.json para certificados SSL
echo "Configurando archivo acme.json..."
touch traefik/acme.json
chmod 600 traefik/acme.json

# Copiar archivos de configuración
echo "Copiando archivos de configuración..."
cp ./traefik.yml traefik/
cp ./nginx.conf nginx/conf/

# Crear archivo .env para variables de entorno
echo "Creando archivo .env..."
cat > .env << EOL
# Variables de entorno para producción
DJANGO_SECRET_KEY=$(openssl rand -hex 32)
POSTGRES_DB=futurprive
POSTGRES_USER=futurpriveuser
POSTGRES_PASSWORD=$(openssl rand -hex 16)
EOL

# Generar contraseña para el dashboard de Traefik y Adminer
echo "Para generar contraseñas para Traefik y Adminer, ejecuta:"
echo "htpasswd -nb admin TuContraseñaSegura"
echo "Luego actualiza la línea correspondiente en docker-compose.prod.yml"

# Mensaje informativo
echo "Configuración completa."
echo "Por favor, asegúrate de:"
echo "1. Modificar el correo electrónico en traefik/traefik.yml"
echo "2. Generar y actualizar la contraseña para el panel de Traefik y Adminer"
echo "3. Apuntar tus dominios (futurprive.com, api.futurprive.com, static.futurprive.com, db-admin.futurprive.com) al servidor"
echo ""
echo "Para desplegar la aplicación, ejecuta:"
echo "docker-compose -f docker-compose.prod.yml up -d"