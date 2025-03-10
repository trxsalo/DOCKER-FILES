import { Request, Response } from "express";
import { ProviderWs } from "~/bot/providers/main-providers";
import { createReadStream, existsSync } from "fs";
import { join } from "path";

export class ControllersWedHook {
    /**
     * Webhook para recibir mensajes de Chatwoot y reenviarlos al proveedor.
     */
    chat_webhook = async (req: Request & { providerWs: ProviderWs }, res: Response) => {
        try {

            const providersWs = req.providerWs;
            const { conversation, content, private: privateWoot,message_type } = req.body as ChatWootMessage;

            // Validar existencia del número de teléfono
            const phoneNumber = conversation?.meta?.sender?.phone_number;
            if (!phoneNumber) {
                console.error('❌ Número de teléfono no proporcionado.');
                return res.status(400).json({ error: 'Phone number not provided' });
            }

            const formattedPhone = phoneNumber.toString().replace(/\+/g, "");
            const destination = `${formattedPhone}@c.us`;

            // Enviar el mensaje a través del proveedor
            await providersWs.sendText(destination, content);
            res.send('Ok');
        } catch (error) {
            console.error('❌ Error al procesar el webhook:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    /**
     * Devuelve la imagen del QR para escanear.
     */
    chat_qr = (req: Request, res: Response) => {
        const PATH_ROUTE_QR = join(process.cwd(), 'bot.qr.png');

        // Verificar si el archivo QR existe
        if (!existsSync(PATH_ROUTE_QR)) {
            console.error('❌ QR no encontrado en la ruta:', PATH_ROUTE_QR);
            return res.status(404).json({ error: 'QR not found' });
        }

        const fileStream = createReadStream(PATH_ROUTE_QR);
        res.writeHead(200, { "Content-Type": "image/png" });
        fileStream.pipe(res);
    };

    /**
     * Endpoint simple para verificar si el servidor está funcionando.
     */
    hello = (req: Request, res: Response) => {
        res.status(200).json({ message: 'Hello World' });
    };
}

// Tipado estricto para el cuerpo del mensaje de Chatwoot
type ChatWootMessage = {
    account: {
        id: number;
        name: string;
    };
    additional_attributes: Record<string, unknown>;
    content_attributes: {
        external_error?: string;
    };
    content_type: string;
    content: string;
    conversation: {
        additional_attributes: Record<string, unknown>;
        can_reply: boolean;
        channel: string;
        contact_inbox: {
            id: number;
            contact_id: number;
            inbox_id: number;
            source_id: string;
            created_at: string;
            updated_at: string;
            hmac_verified: boolean;
            pubsub_token: string;
        };
        id: number;
        inbox_id: number;
        messages: Array<Record<string, unknown>>;
        labels: string[];
        meta: {
            sender: {
                phone_number: number;
            };
            assignee: Record<string, unknown>;
            team: Record<string, unknown> | null;
            hmac_verified: boolean;
        };
        status: string;
        custom_attributes: Record<string, unknown>;
        snoozed_until: string | null;
        unread_count: number;
        first_reply_created_at: string;
        priority: string | null;
        waiting_since: number;
        agent_last_seen_at: number;
        contact_last_seen_at: number;
        last_activity_at: number;
        timestamp: number;
        created_at: number;
        updated_at: number;
    };
    created_at: string;
    id: number;
    inbox: {
        id: number;
        name: string;
    };
    message_type: string;
    private: boolean;
    sender: {
        id: number;
        name: string;
        email: string;
        type: string;
    };
    source_id: string | null;
    event: string;
};
