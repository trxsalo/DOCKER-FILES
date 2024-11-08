# Varaibles de entornos
```txt
    POSTGRES_USER=
    POSTGRES_PASSWORD=
    POSTGRES_DB=
    POSTGRES_HOST=
    TOKE=

```

# Build conteiner
```bash
    sudo docker-compose up --build
```
# Levantar container
```bash
    sudo docker-compose up -d
```


# Usar servicio
```bash
    sudo curl "http://localhost:3000/backup?token=123" -o backup.sql

```

# Ver contenedor
```bash
    sudo docker ps -a
```

# Detener contenedor
```bash
    sudo docker-compose stop
```
# Remover contenedor
```bash
    sudo docker-compose down
```


# Build amd64
```bash
    sudo docker login
    sudo docker build -t trxsalo/backup-postgresql-api .
    sudo docker tag trxsalo/backup-postgresql-api trxsalo/backup-postgresql-api:latest
    sudo docker push trxsalo/backup-postgresql-api:latest
```

# Build arm64
```bash
sudo docker buildx build --platform linux/arm64 -t trxsalo/backup-postgresql-api .
sudo docker tag trxsalo/backup-postgresql-api trxsalo/backup-postgresql-api:arm-latest
sudo docker push trxsalo/backup-postgresql-api:arm-latest
```