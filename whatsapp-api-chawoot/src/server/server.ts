import express, {Application,Request,Response, NextFunction, Router} from "express";
import * as dotenv from "dotenv"
import morgan from "morgan";
import {Envs} from "~/config/env";
import {ProviderWs} from "~/bot/providers/main-providers";
import {ChatwootClass} from "~/chatwoot/chatwoot";
dotenv.config();


export  class Server{

    public readonly app:Application = express();
    private readonly routes:Router;
    private port:number;
    private providerWs:ProviderWs;
    private chatWootWs:ChatwootClass;

    constructor(options:Options) {
        this.routes = options.routes;
        this.port = options.port || 3000;
        this.providerWs = options.providerWs;
        this.chatWootWs = options.chatWootWs;
    }

    configuration(){
        this.app.set("port", this.port || Envs.PORT_SERVER);
    }
    listen (){
        this.app.listen(this.app.get("port"));
        console.log("Servidor escuchando en el puerto:", this.app.get("port"));
    }

    private middlewares(){
        this.app.use(express.json());
        this.app.use((req: Request &{providerWs:ProviderWs,chatWootWs:ChatwootClass}, res: Response, next: NextFunction) => {
            req.providerWs = this.providerWs;
            req.chatWootWs = this.chatWootWs;
            next();
        });
        this.app.use(morgan("dev"));
        this.app.use(express.urlencoded({extended:true}));
    }
    async start(){
        this.configuration();
        this.middlewares();
        this.listen();
        this.route();
    }
    route(){
        this.app.use(this.routes);
    }

}

interface Options{
    port?:number;
    routes:Router
    providerWs:ProviderWs
    chatWootWs:ChatwootClass
}