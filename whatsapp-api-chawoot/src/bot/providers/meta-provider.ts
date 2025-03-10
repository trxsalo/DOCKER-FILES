
import  {MetaProvider as Provider} from '@builderbot/provider-meta';
import type {MetaProvider} from '@builderbot/provider-meta';
import {createProvider} from "@builderbot/bot";
import {Envs} from "~/config/env";


export const adapterProviderMeta:MetaProvider = createProvider(Provider,{
    jwtToken: Envs.JWT_TOKEN,
    numberId: Envs.NUMBER_ID,
    verifyToken: Envs.VERIFY_TOKEN,
    version: Envs.VERSION,
});