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
      -H "Authorization: Bearer mi_token_secreto" 
```
# Usar servico meta 

```bash
    curl -i -X POST 'https://graph.facebook.com/v22.0/<your_number_id>/messages'\
  -H 'Authorization: Bearer <your_token_meta_whatsapp>'\
  -H 'Content-Type: application/json'\
  -d '{
    "messaging_product": "whatsapp",
    "to": "<number_send>",
    "type": "template",
    "template": {"name": "hello_world", "language": {"code": "en_US"}}
    }'
```

# Usar WEBHOOK 

```bash
    curl -i -X GET 'https://<your_name_domain_chatwoot>/webhooks/whatsapp/+<number>'\
  -H 'Authorization: Bearer <yor_token>>'
```

# Usar WEBHOOK 

```bash
    curl -i -X POST 'https://<chat_bot_webhook>/private/chat_webhook'\
    -H 'Authorization: Bearer <yor_token>>'\
    -H "Content-Type: application/json" \
    -d '{
          "number": "591********",
          "message": "Hola mundo"
        }'
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