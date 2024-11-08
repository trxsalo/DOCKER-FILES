#!/bin/bash
# Cargar variables de entorno del archivo .env si es necesario
export $(grep -v '^#' .env | xargs)

# Variables de conexión
# Variables de conexión
PASSWORD="$POSTGRES_PASSWORD_BACKUP"
USUARIO="$POSTGRES_USER_BACKUP"
PORT="$POSTGRES_PORT_BACKUP"
HOST="$POSTGRES_HOST_BACKUP"
NUEVA_BASE=$NAME_DATABASE_BACKUP # Nombre de la nueva base de datos a crear
RESPALDO="/tmp/restaurar_backup.sql" # Archivo de respaldo generado
ROL_EXISTENTE="$USUARIO_BACKUP" # Rol existente

# Crear la base de datos si no existe
echo "Creando la base de datos '$NUEVA_BASE' si no existe..."
PGPASSWORD=$PASSWORD psql -U $USUARIO -h $HOST -p $PORT -c "CREATE DATABASE $NUEVA_BASE;" 2>/dev/null || echo "La base de datos ya existe."

# Verificar si el rol "default" existe
ROL_EXISTE=$(PGPASSWORD=$PASSWORD psql -U $USUARIO -h $HOST -p $PORT -tAc "SELECT 1 FROM pg_roles WHERE rolname='default';")

if [ "$ROL_EXISTE" != "1" ]; then
    echo "El rol 'default' no existe. Creándolo..."
    PGPASSWORD=$PASSWORD psql -U $USUARIO -h $HOST  -p $PORT -c "CREATE ROLE default;"
else
    echo "El rol 'default' ya existe."
fi

# Opción de reemplazar el rol "default" en el archivo de respaldo
read -p "¿Quieres reemplazar el rol 'default' en el archivo de respaldo con '$ROL_EXISTENTE'? (s/n): " RESPUESTA
if [ "$RESPUESTA" == "s" ]; then
    echo "Reemplazando el rol 'default' con '$ROL_EXISTENTE' en el archivo de respaldo..."
    sed -i "s/ROLE 'default'/ROLE '$ROL_EXISTENTE'/g" "$RESPALDO"
fi

# Restaurar el respaldo en la nueva base de datos
echo "Restaurando el respaldo en la base de datos '$NUEVA_BASE'..."
PGPASSWORD=$PASSWORD psql -U $USUARIO -h $HOST -p $PORT -d $NUEVA_BASE -f "$RESPALDO"

# Comprobar el resultado
if [ $? -eq 0 ]; then
    echo "Restauración completada con éxito."
else
    echo "Hubo un error durante la restauración."
fi
