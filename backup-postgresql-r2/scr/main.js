"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("./src/routes");
const server_config_1 = require("./src/server-config");
async function main() {
    const app = new server_config_1.Server({
        routes: routes_1.RoutesServer.route,
        port: 3000
    });
    await app.start();
}
main();
