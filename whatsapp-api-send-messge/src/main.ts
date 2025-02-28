import {createBot, createProvider, createFlow} from '@builderbot/bot'
import {MemoryDB as Database} from '@builderbot/bot';
import {BaileysProvider as Provider} from '@builderbot/provider-baileys';
import dotenv from 'dotenv';
dotenv.config();

const {PORT,NUMBER,TOKEN} = process.env;

const main = async () => {
    const adapterFlow = createFlow([])

    const adapterProvider = createProvider(Provider)
    const adapterDB = new Database();

    const {handleCtx, httpServer} = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    adapterProvider.server.get(
        '/hello',
        handleCtx(async (bot, req, res) => {

            const authHeader = req.headers["authorization"].trim();
            // Verifica si el token existe y es válido
            if (!authHeader || authHeader !== `Bearer ${TOKEN}`) {
                return res.end('Unauthorized: Invalid token');
            }

            try {
                await bot?.sendMessage(NUMBER!,`*SUCCESS API*`, {});
                return res.end('Enviado');
            }catch (e) {
                console.log(e);
                   return res.end('Error');
            }
        })
    );

    adapterProvider.server.post(
        "/send-message",
        handleCtx(async (bot, req, res) => {
            const authHeader = req.headers["authorization"];

            if (!authHeader || authHeader !== `Bearer ${TOKEN}`) {
                return res.end('Unauthorized: Invalid token');
            }

            const { number, message, urlMedia } = req.body;
            try {
                await bot?.sendMessage(number, message, { media: urlMedia ?? null });
                return res.end('Enviado');
            } catch (error) {
                console.error("Error sending message:", error);
                   return res.end('Error');
            }
        })
    );

    adapterProvider.on('host', ({phone}) => {
        setTimeout(async () => {
            await adapterProvider.sendMessage(phone, `Chat me "hello" or "hi =>" ${new Date().getTime()}`, {})
        }, 8000);
    });

    httpServer(Number(PORT)??3000);
}

main();