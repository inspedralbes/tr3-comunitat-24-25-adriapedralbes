FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el proyecto
COPY . .

# Exponer el puerto
EXPOSE 8000

# Script para esperar por la base de datos, hacer migraciones y ejecutar el servidor
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Ejecutar entrypoint
ENTRYPOINT ["/entrypoint.sh"]