import { adapterProviderMeta } from "~/bot/providers/meta-provider";
import { adapterProviderBaileys } from "~/bot/providers/baileys-provider";
import { Envs } from "~/config/env";

type ProviderType = 'baileys' | 'meta';

export type ProviderWs = typeof adapterProviderMeta | typeof adapterProviderBaileys;

const providerMap: Record<ProviderType, any> = {
    'meta': adapterProviderMeta,
    'baileys': adapterProviderBaileys,
};


export const configProviderMain:ProviderWs  = providerMap[Envs.PROVIDERS as ProviderType] || adapterProviderMeta;
