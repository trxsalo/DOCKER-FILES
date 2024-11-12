import {Router} from "express";
import {Controllers} from "./controllers";
import {Middleware} from "./middleware";

export class RoutesBackup {

    static get routes():Router{

        const route = Router();
        const controllers = new Controllers();

        //@ts-ignore
        route.get('/backup',controllers.backup);
        //@ts-ignore
        route.get('/backup-save',controllers.backupSave);
        //@ts-ignore
        route.get('/hello',controllers.hello);

        return route;
    }
}