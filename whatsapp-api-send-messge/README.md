# Varaibles de entornos

```txt
    NUMBER=591******
    PORT=3000
    TOKEN=YOUR_TOKEN

```

# Build conteiner

```bash
     docker-compose up --build
```

# Levantar container

```bash
       docker-compose up -d
```

# Usar servicio

```bash
    curl -X POST http://localhost:4000/send-message \
     -H "Authorization: Bearer mi_token_secreto" \
     -H "Content-Type: application/json" \
     -d '{
          "number": "591********",
          "message": "Hola mundo"
        }'
        
        
     curl -X GET   http://localhost:4000/hello  \
      -H "Authorization: Bearer mi_token_secreto" \
```

# Ver contenedor

```bash
       docker ps -a
```

# Detener contenedor

```bash
       docker-compose stop
```

# Remover contenedor

```bash
       docker-compose down
```

# Build amd64

```bash
       docker login
       docker build -t trxsalo/whatsapp-api .
       docker tag trxsalo/whatsapp-api trxsalo/whatsapp-api:latest
       docker push trxsalo/whatsapp-api:latest
```

# Build arm64

```bash
   docker buildx build --platform linux/arm64 -t trxsalo/whatsapp-api .
   docker tag trxsalo/whatsapp-api trxsalo/whatsapp-api:arm-latest
   docker push trxsalo/whatsapp-api:arm-latest
```