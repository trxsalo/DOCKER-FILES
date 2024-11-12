
import {RoutesServer} from "./src/routes";
import {Server} from "./src/server-config";
async function main(){
    const app:Server = new  Server({
        routes:RoutesServer.route,
        port:3000
    });
    await app.start();
}
main();