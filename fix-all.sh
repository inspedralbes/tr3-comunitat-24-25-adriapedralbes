#!/bin/bash

# Script para solucionar todos los problemas

echo "==============================================="
echo "Iniciando solución completa para FuturPrive..."
echo "==============================================="

# 1. Hacer ejecutables todos los scripts
echo "Haciendo ejecutables todos los scripts..."
chmod +x ./reset-ssl.sh
chmod +x ./check-django.sh
chmod +x ./restart-django.sh
chmod +x ./rebuild-django.sh
chmod +x ./test-email.sh

# 2. Reconstruir el contenedor de Django
echo "Reconstruyendo Django con la nueva configuración..."
./rebuild-django.sh

# 3. Esperar unos segundos
echo "Esperando a que el servicio esté completamente iniciado..."
sleep 10

# 4. Probar el correo
echo "Probando el envío de correo..."
./test-email.sh

echo "==============================================="
echo "¡Proceso completado!"
echo "==============================================="
echo "Si los correos siguen fallando, intenta estas opciones:"
echo "1. Verifica la contraseña del correo en el archivo backend/.env"
echo "2. Prueba con otro proveedor de correo como Gmail"
echo "3. Revisa los logs detallados del contenedor Django"
echo "==============================================="