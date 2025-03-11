#!/bin/bash
# Hacer el script ejecutable
chmod +x $0

# Script para crear un superusuario manualmente en producción
echo "🔵 Creando superusuario (admin/admin123)..."
docker exec -it django-app python create_superuser.py

echo "✅ Si no hay errores, el superusuario debería estar creado."
echo "   Intenta acceder a api.futurprive.com/admin con usuario 'admin' y contraseña 'admin123'"
