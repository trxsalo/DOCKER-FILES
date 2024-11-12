//Controller
import {Request, Response} from "express";
import {backup} from "../functions/backup";
import {bucket} from "../functions/bucket";

export class Controllers {

    backup = async (req: Request, res: Response) => {
        try {
            await backup(req, res);
        } catch (err) {
            return res.status(500).json({ message: 'Error en el servidor' });
        }
    };
    backupSave = async (req: Request, res: Response) => {
        try {
            await bucket(req, res);
        } catch (err) {
            return res.status(500).json({ message: 'Error en el servidor' });
        }
    };

    hello = (req: Request, res: Response) => {
        return res.status(200).json({ message: 'Hello World' });
    }

}
