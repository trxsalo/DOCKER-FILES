import express, {Application, Router} from "express";
import * as dotenv from "dotenv"
import morgan from "morgan";
dotenv.config();


export  class Server{

    public readonly app:Application = express();
    private readonly routes:Router;
    private port:number;

    constructor(options:Options) {
        this.routes = options.routes;
        this.port = options.port || 3000;
    }

    configuration(){
        this.app.set("port", this.port || process.env.PORT || 8080);
    }
    listen (){
        this.app.listen(this.app.get("port"));
        console.log("Servidor escucchando en el puerto:", this.app.get("port"));
    }

   private middlewares(){
       this.app.use(express.json());
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
}