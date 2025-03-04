# Dockerfile
FROM node:18-alpine

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Crear y establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y pnpm-lock.yaml (si existe)
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias
RUN pnpm install

# En desarrollo no necesitamos copiar los archivos
# ya que los montamos como volumen en docker-compose.yml

# Exponer el puerto 3000
EXPOSE 3000

# Comando para iniciar la aplicación en modo desarrollo
CMD ["pnpm", "dev"]