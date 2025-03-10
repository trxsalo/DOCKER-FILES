import { readFile } from 'fs/promises';
import FormData from 'form-data';
import {Envs} from "~/config/env";

export class ChatwootClass {
    private config: ChatwootConfig;

    constructor(_config: Partial<ChatwootConfig>) {
        this.config = _config as ChatwootConfig;
    }

    private formatNumber(number: string): string {
        return number.startsWith("+") ? number : `+${number}`;
    }

    private buildHeader(): Headers {
        const headers = new Headers();
        headers.append('api_access_token', this.config.token);
        headers.append('Content-Type', 'application/json');
        return headers;
    }

    private buildBaseUrl(path: string): string {
        return `${Envs.ENDPOINT_CHATWOOT}/api/v1/accounts/${Envs.ACCOUNT_CHATWOOT}${path}`;
    }

    async findContact(from: string) {
        try {
            const url = this.buildBaseUrl(`/contacts/search?q=${from}`);
            const response = await fetch(url, { headers: this.buildHeader(), method: 'GET' });
            const data = await response.json();
            return data.payload[0];
        } catch (error) {
            console.error(`[Error searchByNumber]`, error);
            return [];
        }
    }

    async createContact(dataIn: ContactData) {
        try {
            dataIn.from = this.formatNumber(dataIn.from);

            const payload = {
                inbox_id: dataIn.inbox,
                name: dataIn.name,
                phone_number: dataIn.from,
            };

            const url = this.buildBaseUrl(`/contacts`);
            const response = await fetch(url, {
                headers: this.buildHeader(),
                method: 'POST',
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            return data.payload.contact;
        } catch (error) {
            console.error(`[Error createContact]`, error);
            return;
        }
    }

    async findOrCreateContact(dataIn: ContactData) {
        try {
            const contact = await this.findContact(dataIn.from);
            return contact || await this.createContact(dataIn);
        } catch (error) {
            console.error(`[Error findOrCreateContact]`, error);
            return;
        }
    }

    async createConversation(dataIn: ConversationData) {
        try {
            const url = this.buildBaseUrl(`/conversations`);
            const payload = {
                inbox_id: dataIn.inbox_id,
                contact_id: dataIn.contact_id,
                custom_attributes: { phone_number: this.formatNumber(dataIn.phone_number) },
            };

            const response = await fetch(url, {
                method: "POST",
                headers: this.buildHeader(),
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`[Error createConversation]`, error);
            return;
        }
    }

    async findConversation(phone_number: string) {
        try {
            const payload = [{
                attribute_key: "phone_number",
                attribute_model: "standard",
                filter_operator: "equal_to",
                values: [this.formatNumber(phone_number)],
                custom_attribute_type: "",
            }];

            const url = this.buildBaseUrl(`/conversations/filter`);
            const response = await fetch(url, {
                method: "POST",
                headers: this.buildHeader(),
                body: JSON.stringify({ payload }),
            });

            const data = await response.json();
            return data.payload;
        } catch (error) {
            console.error(`[Error findConversation]`, error);
            return;
        }
    }

    async findOrCreateConversation(dataIn: ConversationData) {
        try {
            const conversations = await this.findConversation(dataIn.phone_number);
            return conversations.length ? conversations[0] : await this.createConversation(dataIn);
        } catch (error) {
            console.error(`[Error findOrCreateInbox]`, error);
            return;
        }
    }

    async createMessage(dataIn: MessageData) {
        try {
            const url = this.buildBaseUrl(`/conversations/${dataIn.conversation_id}/messages`);
            const form = new FormData();

            // ✅ Validar si el mensaje es válido
            if (!dataIn.msg || typeof dataIn.msg !== 'string' || dataIn.msg.trim() === '') {
                console.error('❌ El contenido del mensaje es inválido o vacío.');
                return { error: 'Message content is empty or invalid' };
            }

            form.append("content", dataIn.msg);
            form.append("message_type", dataIn.mode);
            form.append("private", "false");

            // ✅ Adjuntar archivos si existen
            if (dataIn.attachment?.length) {
                try {
                    const filePath = dataIn.attachment[0];
                    const fileName = filePath.split('/').pop() || 'file';
                    const fileBuffer = await readFile(filePath);
                    form.append("attachments[]", fileBuffer, fileName);
                } catch (err) {
                    console.error('❌ Error al leer el archivo adjunto:', err);
                    return { error: 'Failed to process attachment' };
                }
            }

            // ✅ Establecer las cabeceras manuales, excepto `Content-Type`
            const headers = {
                api_access_token: this.config.token,
                ...form.getHeaders(), // Deja que FormData maneje Content-Type
            };

            const response = await fetch(url, {
                method: "POST",
                headers,
                //@ts-ignore
                body: form,
            });

            const result = await response.json();

            // Validar respuesta del servidor
            if (!response.ok) {
                console.error('❌ Error en la respuesta del servidor:', result);
                return result;
            }

            console.log('✅ Mensaje enviado correctamente al webhook:', result);
            return result;

        } catch (error) {
            console.error(`[Error createMessage]`, error);
            return { error: 'Internal Server Error' };
        }
    }


    async findInbox(dataIn: InboxData) {
        try {
            const url = this.buildBaseUrl(`/inboxes`);
            const response = await fetch(url, { headers: this.buildHeader(), method: 'GET' });
            const data = await response.json();
            return data.payload.find((o: { name: string }) => o.name === dataIn.name);
        } catch (error) {
            console.error(`[Error findInbox]`, error);
            return;
        }
    }

    async createInbox(dataIn: InboxData) {
        try {
            const payload = {
                name: dataIn.name,
                channel: { type: "api", webhook_url: "" },
            };

            const url = this.buildBaseUrl(`/inboxes`);
            const response = await fetch(url, {
                headers: this.buildHeader(),
                method: 'POST',
                body: JSON.stringify(payload),
            });

            return await response.json();
        } catch (error) {
            console.error(`[Error createInbox]`, error);
            return;
        }
    }

    async findOrCreateInbox(dataIn: InboxData) {
        try {
            const inbox = await this.findInbox(dataIn);
            return inbox || await this.createInbox(dataIn);
        } catch (error) {
            console.error(`[Error findOrCreateInbox]`, error);
            return;
        }
    }
}


interface ChatwootConfig {
    account: string;
    token: string;
    endpoint: string;
}

interface ContactData {
    from: string;
    name: string;
    inbox: string;
}

interface ConversationData {
    inbox_id: string;
    contact_id: string;
    phone_number: string;
}

interface MessageData {
    msg: string;
    mode: "incoming" | "outgoing";
    conversation_id: string;
    attachment?: string[];
}

interface InboxData {
    name: string;
}
