# Usa una imagen base de Node.js
# Usa una imagen base de Alpine
#FROM node:20-alpine

# Instala el cliente de PostgreSQL y otras dependencias
#RUN apk update && \
#   apk add --no-cache postgresql-client bash curl

FROM ubuntu:20.04

# Configura el entorno y actualiza el sistema
ENV DEBIAN_FRONTEND=noninteractive

# Instala wget, gnupg y otras herramientas para configurar repositorios adicionales
RUN apt-get update && \
    apt-get install -y wget gnupg curl software-properties-common && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs &&\
    apt-get clean

# Instala pnpm globalmente
RUN npm install -g pnpm

# Verifica la versión de PostgreSQL instalada
#RUN psql --version || echo "Cliente PostgreSQL instalado."
# Crea el directorio de la aplicación
WORKDIR /app

# Copia el resto de los archivos de la aplicación desde la carpeta src
COPY ./ .

# Instala las dependencias de Node.js
RUN pnpm i

# Expone el puerto de la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación, apuntando a server.js en /app
CMD ["pnpm", "start"]
