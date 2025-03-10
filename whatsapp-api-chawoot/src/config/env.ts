
import env from 'env-var';
import dotenv from 'dotenv';
dotenv.config();

export const Envs = {
    //config server
    PORT : env.get('PORT').required().asPortNumber(),//server chat
    PORT_SERVER : env.get('PORT_SERVER').required().asPortNumber(),//server webhook

    NUMBER : env.get('NUMBER').required().asInt(),
    TOKEN : env.get('TOKEN').required().asString(),
    //api meta
    JWT_TOKEN : env.get('JWT_TOKEN').required().asString(),
    NUMBER_ID : env.get('NUMBER_ID').required().asString(),
    VERIFY_TOKEN : env.get('VERIFY_TOKEN').required().asString(),
    VERSION: env.get('VERSION').required().asString(),
    //provider select
    PROVIDERS:env.get('PROVIDERS').required().asString(),
    DATABASE:env.get('DATABASE').required().asString(),

    //chatwoot
    ACCOUNT_CHATWOOT:env.get('ACCOUNT_CHATWOOT').required().asString(),
    TOKEN_CHATWOOT:env.get('TOKEN_CHATWOOT').required().asString(),
    ENDPOINT_CHATWOOT:env.get('ENDPOINT_CHATWOOT').required().asString()



}