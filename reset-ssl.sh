#!/bin/bash

# Script para resetear certificados SSL

echo "Reseteando certificados SSL..."

# Detener contenedores
docker-compose -f docker-compose.prod.yml down

# Backup del archivo acme.json actual (por si acaso)
if [ -f ./traefik/acme.json ]; then
  mv ./traefik/acme.json ./traefik/acme.json.bak
fi

# Crear un nuevo archivo acme.json vacío
echo "{}" > ./traefik/acme.json
chmod 600 ./traefik/acme.json

# Iniciar los contenedores nuevamente
docker-compose -f docker-compose.prod.yml up -d

echo "Certificados SSL reseteados. Por favor, espera unos minutos para que se generen nuevos certificados."
echo "Puedes verificar el progreso con: docker-compose -f docker-compose.prod.yml logs -f traefik"