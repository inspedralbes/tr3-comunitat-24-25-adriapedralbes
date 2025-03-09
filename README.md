# Futurprive

## Instalación y Despliegue

### Desarrollo

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/tr3-comunitat-24-25-adriapedralbes.git
   cd tr3-comunitat-24-25-adriapedralbes
   ```

2. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

   ```
   DATABASE_NAME=futurprive
   DATABASE_USER=usuario
   DATABASE_PASSWORD=contraseña
   ```

3. Inicia los contenedores:

   ```bash
   docker-compose up -d
   ```

4. Accede a la aplicación en: http://localhost:3000
5. Accede a Adminer en: http://localhost:8080
   - Sistema: PostgreSQL
   - Servidor: postgres
   - Usuario: adriaroot
   - Contraseña: adriaestevez321322610
   - Base de datos: futurprive

### Producción

1. Asegúrate de tener configurados los dominios `futurprive.com` y `api.futurprive.com` apuntando a tu servidor.

2. Crea los archivos de entorno necesarios:

   - `.env` (raíz):

     ```
     DATABASE_NAME=futurpriveprod
     DATABASE_USER=adriarootprod
     DATABASE_PASSWORD=tusuperpassword
     DATABASE_ENGINE=django.db.backends.postgresql
     DATABASE_PORT=5432
     DEBUG=False
     SECRET_KEY=tu_clave_secreta
     ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,futurprive.com,api.futurprive.com
     ```

   - `.env.prod` (raíz) - ¡NO subir a Git!:
     ```
     POSTGRES_DB=futurpriveprod
     POSTGRES_USER=adriarootprod
     POSTGRES_PASSWORD=tusuperpassword
     ```
   - `backend/.env`:
     ```
     EMAIL_HOST=mail.privateemail.com
     EMAIL_PORT=587
     EMAIL_USE_TLS=True
     EMAIL_USE_SSL=False
     EMAIL_HOST_USER=adria@futurprive.com
     EMAIL_HOST_PASSWORD=tu_contraseña_email
     DEFAULT_FROM_EMAIL=adria@futurprive.com
     EMAIL_TIMEOUT=30
     SERVER_EMAIL=adria@futurprive.com
     SITE_URL=https://futurprive.com
     SECRET_KEY=tu_clave_secreta
     DEBUG=False
     ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,futurprive.com,api.futurprive.com,django
     DATABASE_ENGINE=django.db.backends.postgresql
     DATABASE_NAME=futurpriveprod
     DATABASE_USER=adriarootprod
     DATABASE_PASSWORD=tusuperpassword
     DATABASE_PORT=5432
     ```

3. Asegúrate de que el archivo `traefik/acme.json` existe y tiene los permisos adecuados:

   ```bash
   mkdir -p traefik
   touch traefik/acme.json
   chmod 600 traefik/acme.json
   ```

4. Ejecuta el script de despliegue:

   ```bash
   chmod +x deploy.sh
   chmod +x reset-ssl.sh
   chmod +x check-django.sh
   ./deploy.sh
   ```

5. Si encuentras problemas con el API:

   ```bash
   ./check-django.sh
   ```

6. Si encuentras problemas con SSL:

   ```bash
   ./reset-ssl.sh
   ```

7. La aplicación estará disponible en:
   - Frontend: https://futurprive.com
   - API: https://api.futurprive.com
