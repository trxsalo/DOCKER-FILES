
import {initFlow} from "~/bot/template/main-templates";
import {configProviderMain} from "~/bot/providers/main-providers";
import {configDatabaseMain} from "~/bot/database/main-database";
import {createBot} from '@builderbot/bot';
import {Server} from "~/server/server";
import {RoutesServer} from "~/server/route/main-route";
import {ChatwootClass} from "~/chatwoot/chatwoot";
import {Envs} from "~/config/env";


export const chatwootWs = new ChatwootClass({
    account:Envs.ACCOUNT_CHATWOOT,
    endpoint:Envs.ENDPOINT_CHATWOOT,
    token:Envs.TOKEN_CHATWOOT
})

export const botInit = async () => {
    const adapterFlow = initFlow;
    const adapterProvider = configProviderMain;

    const {handleCtx, httpServer,} = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: configDatabaseMain,
    });

    const app:Server = new  Server({
        routes:RoutesServer.route,
        port:3000,
        providerWs:adapterProvider,
        chatWootWs:chatwootWs,
    });

    httpServer(4000);
    // Iniciar servidor
    await app.start();

};

