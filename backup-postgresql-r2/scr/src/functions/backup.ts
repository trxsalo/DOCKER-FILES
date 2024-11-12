import {Request, Response} from "express";
import {spawn} from 'child_process';
import {Envs} from "../env/envs";

export const backup = async (req: Request, res: Response) => {

    let init, end;
    try {
        console.log('Backup started');
        init = Date.now();

        const backupFileName = `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
        const data = await ejecutarPgDump();

        end  = Date.now();

        res.setHeader('Content-disposition', `attachment; filename=${backupFileName}`);
        res.setHeader('Content-type', 'application/sql');
        res.send(data);
    } catch (error) {
        console.error(error, 'Error en backup');
        res.status(500).send(error);
    } finally {
        const duration = (end! - init!) / 1000;
        console.log({
            message: 'Backup finished',
            duration: `${duration} seconds`
        });
    }
}


export const ejecutarPgDump = () => {
    return new Promise((resolve, reject) => {
        const pgDumpCommand = `PGPASSWORD=${Envs.POSTGRES_PASSWORD} PGSSLMODE=require pg_dump -U ${Envs.POSTGRES_USER} -h ${Envs.POSTGRES_HOST} -d ${Envs.POSTGRES_DB}`;

        const pgDump = spawn('sh', ['-c', pgDumpCommand]);
        let stdout = '';
        let stderr = '';

        pgDump.stdout.on('data', (data: Buffer) => {
            stdout += data;
        });

        pgDump.stderr.on('data', (data: Buffer) => {
            stderr += data;
        });

        pgDump.on('close', (code: any) => {
            if (code !== 0) {
                reject(new Error(`Error ejecutando pg_dump: ${stderr}`));
            } else {
                resolve(stdout);
            }
        });


    });
};