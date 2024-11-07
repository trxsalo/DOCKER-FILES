# Usa una imagen base de Node.js
FROM node:20

# Instala el cliente de PostgreSQL para poder usar pg_dump
RUN apt-get update && \
    apt-get install -y postgresql-client libpq-dev && \
    apt-get clean

# Crea el directorio de la aplicación
WORKDIR /app

# Copia el resto de los archivos de la aplicación desde la carpeta src
COPY src/ .


# Instala las dependencias de Node.js
RUN npm install

# Expone el puerto de la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación, apuntando a server.js en /app
CMD ["node", "server.js"]
