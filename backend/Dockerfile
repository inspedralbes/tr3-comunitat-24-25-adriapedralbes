FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir python-socketio socketio

# Copiar el proyecto
COPY . .

# Exponer el puerto
EXPOSE 8000

# Script para esperar por la base de datos, hacer migraciones y ejecutar el servidor
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Ejecutar entrypoint
ENTRYPOINT ["/entrypoint.sh"]