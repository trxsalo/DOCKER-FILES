import {NextFunction,Response,Request} from "express";
import {Envs} from "../env/envs";

export class Middleware{

    static async validateTokenRequest (req:Request,res:Response,next:NextFunction){

        const authorization = req.headers.authorization;


        if(!authorization)  res.status(401).send('Not token provided');
        if(!authorization?.startsWith('Bearer'))res.status(401).send('Invalid Bearer token');

        const token:string = authorization!.split(' ').at(1) || '' as string;
        try {

            if (!token || token !== Envs.AUTH_TOKEN) {
                 res.status(403).json({message: 'Access denied: Invalid token'});
            }
            next();
        }
        catch (err){
             res.status(500).json({message: 'Error en el servidor'});
        }
    }

}