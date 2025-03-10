import {createProvider} from "@builderbot/bot";
import {BaileysProvider as Provider} from '@builderbot/provider-baileys';
import type {BaileysProvider} from '@builderbot/provider-baileys';


export const adapterProviderBaileys:BaileysProvider = createProvider(Provider)