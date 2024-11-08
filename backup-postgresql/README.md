## Build conteiner
```bash
    sudo docker-compose up --build
```
## Levantar container
```bash
    sudo docker-compose up -d
```


## Usar servicio
```bash
    sudo curl "http://localhost:3000/backup?token=123" -o backup.sql

```

## Ver contenedor
```bash
    sudo docker ps -a
```

## Detener contenedor
```bash
    sudo docker-compose stop
```
## Remover contenedor
```bash
    sudo docker-compose down
```

