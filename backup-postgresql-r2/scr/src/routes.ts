//Routes
import {Router} from "express";
import {Controllers} from "./presentation/controllers";
import {RoutesBackup} from "./presentation/routes";
import {Middleware} from "./presentation/middleware";

export class RoutesServer {
    static get route(): Router {
        const route = Router();
        //Rutas
        route.use('/api',[Middleware.validateTokenRequest],RoutesBackup.routes);

        return route;
    }
}