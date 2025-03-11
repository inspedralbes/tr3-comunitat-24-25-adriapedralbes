#!/bin/bash

# Generamos un nombre de usuario único usando una combinación del prefijo 'futurprive_' y caracteres aleatorios
ADMIN_USERNAME="futurprive_$(openssl rand -hex 4)"

# Generamos una contraseña segura aleatoria (24 caracteres)
ADMIN_PASSWORD=$(openssl rand -base64 18 | tr -d '=+/' | cut -c1-24)

# Creamos el administrador en el contenedor
echo "Creando un nuevo superusuario con credenciales seguras..."
docker exec -i django-app python -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
try:
    User.objects.create_superuser('$ADMIN_USERNAME', 'admin@futurprive.com', '$ADMIN_PASSWORD');
    print('Superusuario creado exitosamente');
except Exception as e:
    print(f'Error: {e}');
"

echo ""
echo "==================== INFORMACIÓN DE ACCESO SEGURO ===================="
echo "Se ha creado un nuevo superusuario con estas credenciales:"
echo ""
echo "  URL de acceso: https://api.futurprive.com/admin/"
echo "  Usuario: $ADMIN_USERNAME"
echo "  Contraseña: $ADMIN_PASSWORD"
echo ""
echo "IMPORTANTE: Guarda estas credenciales en un gestor de contraseñas seguro."
echo "Este mensaje se mostrará SOLO UNA VEZ y la información no se guarda"
echo "en ningún archivo del repositorio por razones de seguridad."
echo "==================================================================="
echo ""
