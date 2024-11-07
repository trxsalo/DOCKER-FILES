// backup-service.js
import express from 'express';
import dotenv from 'dotenv';
import {exec} from 'child_process'

dotenv.config();
const PORT = 3000;
const app = express();


// Variables de conexión a PostgreSQL
const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'yourpassword';
const POSTGRES_DB = process.env.POSTGRES_DB || 'yourdatabase';
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';

const AUTH_TOKEN = process.env.TOKE;


app.get('/backup', (req, res) => {

    const token = req.query.token;

    // Verifica si el token proporcionado es válido
    if (!token || token !== AUTH_TOKEN) {
        return res.status(403).json({message: 'Access denied: Invalid token'});
    }

    // Generar un nombre de archivo único para el backup
    const backupFileName = `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;

    // Comando de pg_dump para realizar el backup
    const pgDumpCommand = `PGPASSWORD=${POSTGRES_PASSWORD} pg_dump -U ${POSTGRES_USER} -h ${POSTGRES_HOST} -d ${POSTGRES_DB} --sslmode=require`;

    // Ejecutar el comando y enviar el resultado como respuesta
    exec(pgDumpCommand, (error, stdout, stderr) => {
        if (error) {
            console.error('Error ejecutando pg_dump:', stderr);
            res.status(500).send('Error generando el backup');
        } else {
            res.setHeader('Content-disposition', `attachment; filename=${backupFileName}`);
            res.setHeader('Content-type', 'application/sql');
            res.send(stdout);
        }
    });
});

app.listen(PORT, () => {
    console.log(`Backup service running on port ${PORT}`);
});
