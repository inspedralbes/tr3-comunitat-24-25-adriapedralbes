#!/bin/bash
# Guardar como verify_media_setup.sh y ejecutar con: bash verify_media_setup.sh

# Colores para la salida
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Verificando configuración de archivos media ===${NC}"

# 1. Verificar existencia de directorios media en contenedor Django
echo -e "\n${YELLOW}Verificando directorios media en el contenedor Django...${NC}"
if docker-compose exec django ls -la /app/media 2>/dev/null; then
    echo -e "${GREEN}✓ El directorio /app/media existe${NC}"
else
    echo -e "${RED}✗ El directorio /app/media NO existe${NC}"
fi

if docker-compose exec django ls -la /app/media/avatars 2>/dev/null; then
    echo -e "${GREEN}✓ El directorio /app/media/avatars existe${NC}"
else
    echo -e "${RED}✗ El directorio /app/media/avatars NO existe${NC}"
fi

if docker-compose exec django ls -la /app/media/post_images 2>/dev/null; then
    echo -e "${GREEN}✓ El directorio /app/media/post_images existe${NC}"
else
    echo -e "${RED}✗ El directorio /app/media/post_images NO existe${NC}"
fi

# 2. Verificar volumen persistente
echo -e "\n${YELLOW}Verificando volumen persistente de media...${NC}"
VOLUME_INFO=$(docker volume inspect media_data 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ El volumen media_data existe${NC}"
else
    echo -e "${RED}✗ El volumen media_data NO existe${NC}"
fi

# 3. Crear un archivo de prueba en los directorios de media
echo -e "\n${YELLOW}Creando archivos de prueba en directorios media...${NC}"
if docker-compose exec django bash -c "echo 'test' > /app/media/test_file.txt"; then
    echo -e "${GREEN}✓ Se pudo crear un archivo en /app/media${NC}"
else
    echo -e "${RED}✗ No se pudo crear un archivo en /app/media${NC}"
fi

if docker-compose exec django bash -c "echo 'test' > /app/media/avatars/test_avatar.jpg"; then
    echo -e "${GREEN}✓ Se pudo crear un archivo en /app/media/avatars${NC}"
else
    echo -e "${RED}✗ No se pudo crear un archivo en /app/media/avatars${NC}"
fi

if docker-compose exec django bash -c "echo 'test' > /app/media/post_images/test_post.jpg"; then
    echo -e "${GREEN}✓ Se pudo crear un archivo en /app/media/post_images${NC}"
else
    echo -e "${RED}✗ No se pudo crear un archivo en /app/media/post_images${NC}"
fi

# 4. Verificar que Django sirve los archivos correctamente
echo -e "\n${YELLOW}Verificando que Django sirve los archivos media correctamente...${NC}"
docker-compose exec django bash -c "python -c \"
import os
from django.conf import settings
print('MEDIA_URL configurado como:', settings.MEDIA_URL)
print('MEDIA_ROOT configurado como:', settings.MEDIA_ROOT)
print('¿MEDIA_ROOT existe?:', os.path.exists(settings.MEDIA_ROOT))
print('¿MEDIA_ROOT tiene permisos correctos?:', oct(os.stat(settings.MEDIA_ROOT).st_mode)[-3:])
\""

echo -e "\n${YELLOW}=== Verificación completa ===${NC}"
echo -e "${GREEN}Para probar si los archivos se sirven correctamente, intenta acceder a:${NC}"
echo -e "- https://api.futurprive.com/media/test_file.txt"
echo -e "- https://api.futurprive.com/media/avatars/test_avatar.jpg"
echo -e "- https://api.futurprive.com/media/post_images/test_post.jpg"