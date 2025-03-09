#!/bin/bash

# Script para solucionar problemas de CORS

echo "==============================================="
echo "Iniciando solución para problemas de CORS..."
echo "==============================================="

# Reconstruir el contenedor de Django con la nueva configuración
echo "Reconstruyendo Django con la nueva configuración de CORS..."
./rebuild-django.sh

echo "==============================================="
echo "¡Proceso completado!"
echo "==============================================="
echo ""
echo "Los siguientes cambios han sido aplicados:"
echo "1. Configurado CORS para permitir todas las solicitudes (CORS_ALLOW_ALL_ORIGINS=True)"
echo "2. Añadido un middleware CORS personalizado"
echo "3. Añadidos encabezados CORS a todas las respuestas de API"
echo "4. Modificadas las vistas para manejar solicitudes OPTIONS"
echo ""
echo "Prueba ahora tu formulario de suscripción. Debería funcionar correctamente."
echo "==============================================="