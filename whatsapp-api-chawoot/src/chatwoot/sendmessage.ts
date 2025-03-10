import {Envs} from "~/config/env";

interface ChatwootMessage {
    content: string;
    message_type: 'incoming' | 'outgoing';
    private: boolean;
    content_type: string;
    content_attributes?: Record<string, unknown>;
}

interface ChatwootResponse {
    id?: number;
    content?: string;
    error?: string;
}

export const sendMessageChatwoot = async (
    {
        msg,
        messageType,
        conversation_id,
    }: {
        msg: string,
        messageType: "incoming" | "outgoing"
        conversation_id: string
    }
): Promise<ChatwootResponse> => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("api_access_token", Envs.TOKEN_CHATWOOT);
        myHeaders.append("Content-Type", "application/json");

        const payload: ChatwootMessage = {
            content: msg,
            message_type: messageType,
            private: false,
            content_type: "input_email",
            content_attributes: {},
        };

        const requestOptions: RequestInit = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(payload),
        };

        const response = await fetch(
            `${Envs.ENDPOINT_CHATWOOT}/api/v1/accounts/${Envs.ACCOUNT_CHATWOOT}/conversations/${conversation_id}/messages`,
            requestOptions
        );

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const data = await response.json();
        return data as ChatwootResponse;

    } catch (error) {
        console.error("❌ Error al enviar mensaje a Chatwoot:", error);
        return {error: (error as Error).message};
    }
};
