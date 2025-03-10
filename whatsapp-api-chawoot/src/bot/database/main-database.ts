



import { Envs } from "~/config/env";
import {adapterDBMemory} from "~/bot/database/database-memory";

type ProviderType = 'memory' | 'lite' |'postgres';

const providerMap: Record<ProviderType, any> = {
    memory: adapterDBMemory,
    lite:null,
    postgres:null
};

export const configDatabaseMain = providerMap[Envs.PROVIDERS as ProviderType] || adapterDBMemory;
