// backup-service.js

/*
*   devuelve el backup.sql
*   curl "http://localhost:3000/backup?token=123" -o backup.sql
**/


import express from 'express';
import dotenv from 'dotenv';
import { promisify } from 'node:util';
import child_process from 'node:child_process';
import { spawn } from 'child_process';
const exec = promisify(child_process.exec);

dotenv.config();
const PORT = 3000;
const app = express();

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




/*
* Recupera un backup de la base de datos y lo restaura en la base de datos
* curl "http://localhost:3000/backup -o result.txt"
* */

/*
import express from 'express';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

dotenv.config();
const PORT = 3000;
const app = express();

// Variables de conexión a PostgreSQL
const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'yourpassword';
const POSTGRES_DB = process.env.POSTGRES_DB || 'yourdatabase';
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
const POSTGRES_PORT = process.env.POSTGRES_PORT || '5432'; // Puerto de PostgreSQL

// Ruta del archivo temporal
const backupPath = path.join('/tmp/', 'restaurar_backup.sql');

// Función para ejecutar pg_dump y guardar en backup.sql
const ejecutarPgDump = () => {
    return new Promise((resolve, reject) => {
        const pgDumpCommand = `PGPASSWORD=${POSTGRES_PASSWORD} pg_dump -U ${POSTGRES_USER} -h ${POSTGRES_HOST} -d ${POSTGRES_DB} -p ${POSTGRES_PORT}`;
        const pgDump = spawn('sh', ['-c', pgDumpCommand]);

        const writeStream = fs.createWriteStream(backupPath);
        pgDump.stdout.pipe(writeStream);

        let stderr = '';

        pgDump.stderr.on('data', (data) => {
            stderr += data;
        });

        pgDump.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Error ejecutando pg_dump: ${stderr}`));
            } else {
                resolve(backupPath);
            }
        });
    });
};

// Función para ejecutar el script de restauración
const ejecutarRestauracion = () => {
    return new Promise((resolve, reject) => {
        const restoreScriptPath = path.join('./', 'restaurar_backup.sh');
        const comando = `sh ${restoreScriptPath}`;

        exec(comando, (error, stdout, stderr) => {
            if (error) {
                reject(`Error ejecutando el script de restauración: ${stderr}`);
            } else {
                resolve(stdout);
            }
        });
    });
};

// Endpoint para generar el backup y ejecutar el script de restauración
app.get('/backup', async (req, res) => {
    console.log('Backup y restauración iniciados');
    try {
        await ejecutarPgDump();
        const resultadoRestauracion = await ejecutarRestauracion();

        const backupFileName = `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
        res.setHeader('Content-disposition', `attachment; filename=${backupFileName}`);
        res.setHeader('Content-type', 'application/txt');
        res.send(`Backup y restauración completados:\n${resultadoRestauracion}`);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
    finally {
        console.log('Backup y restauración iniciados');
    }
});

app.listen(PORT, () => {
    console.log(`Backup service running on port ${PORT}`);
});
*/