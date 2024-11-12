import 'dotenv/config';
import {get} from 'env-var';

export const Envs = {
    AUTH_TOKEN: get('AUTH_TOKEN').required().asString(),
    POSTGRES_PASSWORD: get('POSTGRES_PASSWORD').required().asString(),
    POSTGRES_USER: get('POSTGRES_USER').required().asString(),
    POSTGRES_HOST: get('POSTGRES_HOST').required().asString(),
    POSTGRES_DB: get('POSTGRES_DB').required().asString(),

    BUCKET_NAME: get('BUCKET_NAME').required().asString(),

    ENPOINT: get('ENPOINT').required().asString(),
    ACCESS_KEY_ID: get('ACCESS_KEY_ID').required().asString(),
    REGION: get('REGION').required().asString(),
    SECRET_ACCESS_KEY: get('SECRET_ACCESS_KEY').required().asString(),
}