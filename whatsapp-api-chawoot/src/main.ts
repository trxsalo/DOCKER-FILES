import {botInit} from "~/bot/bot-init";
import {Server} from "~/server/server";
import {RoutesServer} from "~/server/route/main-route";


const main = async () => {
    await botInit();
}

main()
    .then((value)=>console.log(value))
    .catch((error)=>console.log(error))
    .finally(()=>{
        console.log("Finished initializing...");
    });