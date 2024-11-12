import {Request, Response} from 'express';
import {ejecutarPgDump} from "./backup";
import {ClassR2} from "../r2/r2";
import {Envs} from "../env/envs";

export const bucket = async (req: Request, res: Response) => {

    const token = req.query.token;
    // Verifica si el token proporcionado es válido
    if (!token || token !== Envs.AUTH_TOKEN) {
        return res.status(403).json({message: 'Access denied: Invalid token'});
    }

    const r2 = new ClassR2({
        endpoint: '',
        accessKeyId: '',
        region: '',
        secretAccessKey: ''
    });

    let init, end;

    try {

        init = new Date().getTime();

        const data = await ejecutarPgDump() as Buffer;

        const {objectKey} = await r2.bucket(Envs.BUCKET_NAME).uploadBuffer({
            contents: data,
            mimeType: 'application/sql',
            destination: '/backup'
        });

        return res.status(200).json({message: 'Bucket', key: objectKey});

    } catch (err) {

        return res.status(500).json({message: 'Error en el servidor'});

    } finally {
        end = new Date().getTime();
        console.log({
            message: 'Bucket finished',
            duration: `${(end - init!) / 1000} seconds`
        });
    }
}