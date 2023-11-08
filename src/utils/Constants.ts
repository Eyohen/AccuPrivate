
import dotenv from 'dotenv';
dotenv.config();  // Load environment variables from .env file 
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
