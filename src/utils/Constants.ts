
import dotenv from 'dotenv';
dotenv.config();  // Load environment variables from .env file 


const deployed = process.env.DEPLOYED
const path = deployed ? `/etc/secrets/env` : `${__dirname}/../.env`;
dotenv.config({ path });

export const BAXI_URL: string | undefined = process.env.BAXI_URL
export const BAXI_TOKEN: string | undefined = process.env.BAXI_TOKEN
export const BUYPOWER_URL: string | undefined = process.env.BUYPOWER_URL
export const BUYPOWER_TOKEN: string | undefined = process.env.BUYPOWER_TOKEN
export const DEFAULT_ELECTRICITY_PROVIDER = process.env.DEFAULT_ELECTRICITY_PROVIDER as 'BAXI' | 'BUYPOWERNG'
export const NODE_ENV = process.env.NODE_ENV as 'development' | 'production'
export const EMAIL_HOST = process.env.EMAIL_HOST as string
export const EMAIL_PORT = process.env.EMAIL_PORT as string
export const EMAIL_HOST_ADDRESS = process.env.EMAIL_HOST_ADDRESS as string
export const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID as string
export const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET as string
export const OAUTH_REFRESH_TOKEN = process.env.OAUTH_REFRESH_TOKEN as string
export const OAUTH_ACCESS_TOKEN = process.env.OAUTH_ACCESS_TOKEN as string
export const LOGO_URL = process.env.LOGO_URL as string

export const DB_CONFIG = {
    NAME: process.env.DB_NAME as string,
    USER: process.env.DB_USER as string,
    PASS: process.env.DB_PASS as string,
    PORT: parseInt(process.env.DB_PORT as string),
    DIALECT: process.env.DB_DIALECT as 'postgres',
    HOST: process.env.DB_HOST as string,
    URL: process.env.DB_URL as string,
}