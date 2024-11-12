// backup-service.js

import express from 'express';
import dotenv from 'dotenv';
import { spawn } from 'child_process';

dotenv.config();
const PORT = 3000;
const app = express();

app.get('/backup',async (req, res) => {

    const token = req.query.token;

    // Verifica si el token proporcionado es válido
    if (!token || token !== AUTH_TOKEN) {
        return res.status(403).json({message: 'Access denied: Invalid token'});
    }

    try {
        console.log('Backup started');

        const backupFileName = `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
        const data = await ejecutarPgDump();
        res.setHeader('Content-disposition', `attachment; filename=${backupFileName}`);
        res.setHeader('Content-type', 'application/sql');
        res.send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }finally {
        console.log('Finally backup');
    }
});

app.listen(PORT, async () => {
    console.log(`Backup service running on port ${PORT}`);
});

// Variables de conexión a PostgreSQL
const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'yourpassword';
const POSTGRES_DB = process.env.POSTGRES_DB || 'yourdatabase';
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
const AUTH_TOKEN = process.env.TOKE;

const ejecutarPgDump = () => {
    return new Promise((resolve, reject) => {
        const pgDumpCommand = `PGPASSWORD=${POSTGRES_PASSWORD} PGSSLMODE=require pg_dump -U ${POSTGRES_USER} -h ${POSTGRES_HOST} -d ${POSTGRES_DB}`;

        const pgDump = spawn('sh', ['-c', pgDumpCommand]);
        let stdout = '';
        let stderr = '';

        pgDump.stdout.on('data', (data) => {
            stdout += data;
        });

        pgDump.stderr.on('data', (data) => {
            stderr += data;
        });

        pgDump.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Error ejecutando pg_dump: ${stderr}`));
            } else {
                resolve(stdout);
            }
        });


    });
};


