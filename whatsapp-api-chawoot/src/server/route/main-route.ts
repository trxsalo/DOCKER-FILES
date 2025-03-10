import {Router} from "express";
import {RoutesEndpointProtect, RoutesEndpointPublic} from "~/server/route/route-endpoint";
import {Middleware} from "~/server/middleware/middleware-token";

export class RoutesServer {
    static get route(): Router {

        const route = Router();

        //Rutas
        /*Middleware.validateTokenRequest*/
        route.use('/private',[],RoutesEndpointProtect.routes);

        route.use('/public',[],RoutesEndpointPublic.routes);

        return route;
    }
}