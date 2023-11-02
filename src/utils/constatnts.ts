
import dotenv from 'dotenv'; 
dotenv.config();  // Load environment variables from .env file 
export const BAXI_URL: string | undefined =  process.env.BAXI_URL
export const BAXI_TOKEN: string | undefined = process.env.BAXI_TOKEN
export const BUYPOWER_URL: string | undefined = process.env.BUYPOWER_URL
export const BUYPOWER_TOKEN: string | undefined = process.env.BUYPOWER_TOKEN


