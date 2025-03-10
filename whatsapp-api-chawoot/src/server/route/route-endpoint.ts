import {Router} from "express";
import {ControllersWedHook} from "~/server/controllers/main-controllers";


export class RoutesEndpointProtect {

    static get routes():Router{
        const route = Router();
        const controllers = new ControllersWedHook();
        //@ts-ignore
        route.post('/chat_webhook',controllers.chat_webhook);
        return route;
    }
}
export class RoutesEndpointPublic {

    static get routes():Router{
        const route = Router();
        const controllers = new ControllersWedHook();
        //@ts-ignore
        route.get('/chat_qr',controllers.chat_qr);
        route.get('/hello',controllers.hello);
        return route;
    }
}

