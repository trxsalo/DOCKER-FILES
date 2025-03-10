import {addKeyword} from "@builderbot/bot";
import {eventsFlow} from "~/bot/template/evenst";
import {chatwootWs} from "~/bot/bot-init";
import {sendMessageChatwoot} from "~/chatwoot/sendmessage";

export const initFlowWelcome = addKeyword(eventsFlow.WELCOME)
    .addAction(async (ctx, {flowDynamic}) => {
        const {name, body, verifiedBizName, from, host} = ctx;

        const MESSAGE = `Hello ${name}!
How can I help you?`
        ;

       /* const data =  await chatwootWs.findConversation(`+${from}`);*/

        /*await sendMessageChatwoot({
            messageType: 'incoming',
            msg: body,
            conversation_id: '5',
        });*/

        await flowDynamic(MESSAGE);
    })