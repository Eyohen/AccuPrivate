"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_CONFIG = exports.CRYPTO_PASSWORD = exports.CRYPTO_IV = exports.API_KEY_SECRET = exports.REDIS_URL = exports.REDIS_PORT = exports.REDIS_PASSWORD = exports.REDIS_HOST = exports.ENCRYPTION_KEY = exports.JWT_SECRET = exports.LOGO_URL = exports.OAUTH_ACCESS_TOKEN = exports.OAUTH_REFRESH_TOKEN = exports.OAUTH_CLIENT_SECRET = exports.OAUTH_CLIENT_ID = exports.EMAIL_HOST_ADDRESS = exports.EMAIL_PORT = exports.EMAIL_HOST = exports.NODE_ENV = exports.DEFAULT_ELECTRICITY_PROVIDER = exports.BUYPOWER_TOKEN = exports.BUYPOWER_URL = exports.BAXI_TOKEN = exports.BAXI_URL = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load environment variables from .env file 
const deployed = process.env.DEPLOYED;
const path = deployed ? `/etc/secrets/.env` : `${__dirname}/../.env`;
dotenv_1.default.config({ path });
exports.BAXI_URL = process.env.BAXI_URL;
exports.BAXI_TOKEN = process.env.BAXI_TOKEN;
exports.BUYPOWER_URL = process.env.BUYPOWER_URL;
exports.BUYPOWER_TOKEN = process.env.BUYPOWER_TOKEN;
exports.DEFAULT_ELECTRICITY_PROVIDER = process.env.DEFAULT_ELECTRICITY_PROVIDER;
exports.NODE_ENV = process.env.NODE_ENV;
exports.EMAIL_HOST = process.env.EMAIL_HOST;
exports.EMAIL_PORT = process.env.EMAIL_PORT;
exports.EMAIL_HOST_ADDRESS = process.env.EMAIL_HOST_ADDRESS;
exports.OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
exports.OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
exports.OAUTH_REFRESH_TOKEN = process.env.OAUTH_REFRESH_TOKEN;
exports.OAUTH_ACCESS_TOKEN = process.env.OAUTH_ACCESS_TOKEN;
exports.LOGO_URL = process.env.LOGO_URL;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
exports.REDIS_HOST = process.env.REDIS_HOST;
exports.REDIS_PASSWORD = process.env.REDIS_PASSWORD;
exports.REDIS_PORT = parseInt(process.env.REDIS_PORT);
exports.REDIS_URL = process.env.REDIS_URL;
exports.API_KEY_SECRET = process.env.API_KEY_SECRET;
exports.CRYPTO_IV = process.env.CRYPTO_IV;
exports.CRYPTO_PASSWORD = process.env.CRYPTO_PASSWORD;
exports.DB_CONFIG = {
    NAME: process.env.DB_NAME,
    USER: process.env.DB_USER,
    PASS: process.env.DB_PASS,
    PORT: parseInt(process.env.DB_PORT),
    DIALECT: process.env.DB_DIALECT,
    HOST: process.env.DB_HOST,
    URL: process.env.DB_URL,
};
