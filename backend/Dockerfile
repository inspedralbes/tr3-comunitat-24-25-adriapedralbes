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
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copiar el proyecto
COPY . .

# Asegurarnos de que el entrypoint sea ejecutable
RUN chmod +x /app/entrypoint.sh

# Exponer el puerto
EXPOSE 8000

# Ejecutar entrypoint
CMD ["/bin/bash", "/app/entrypoint.sh"]
