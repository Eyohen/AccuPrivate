"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SU_HOST_EMAIL_3 = exports.SU_HOST_EMAIL_2 = exports.SU_HOST_EMAIL_1 = exports.PRIMARY_ROLES = exports.DB_CONFIG = exports.IRECHARGE_VENDOR_CODE = exports.IRECHARGE_PUBLIC_KEY = exports.IRECHARGE_PRIVATE_KEY = exports.DISCO_LOGO = exports.SENDGRID_API_KEY = exports.KAFKA_BROKER = exports.KAFKA_PASSWORD = exports.KAFKA_USERNAME = exports.KAFKA_CLIENT_ID = exports.ONESIGNAL_APP_ID = exports.ONESIGNAL_API_KEY = exports.CLOUDINARY_API_SECRET = exports.CLOUDINARY_API_KEY = exports.CLOUDINARY_CLOUD_NAME = exports.CRYPTO_PASSWORD = exports.CRYPTO_IV = exports.API_KEY_SECRET = exports.REDIS_URL = exports.REDIS_PORT = exports.REDIS_PASSWORD = exports.REDIS_HOST = exports.ENCRYPTION_KEY = exports.JWT_SECRET = exports.LOGO_URL = exports.OAUTH_ACCESS_TOKEN = exports.OAUTH_REFRESH_TOKEN = exports.OAUTH_CLIENT_SECRET = exports.OAUTH_CLIENT_ID = exports.EMAIL_HOST_ADDRESS = exports.EMAIL_PORT = exports.EMAIL_HOST = exports.NODE_ENV = exports.DEFAULT_ELECTRICITY_PROVIDER = exports.BUYPOWER_TOKEN = exports.BUYPOWER_URL = exports.BAXI_TOKEN = exports.BAXI_URL = void 0;
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
exports.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
exports.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
exports.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
exports.ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;
exports.ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
exports.KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID;
exports.KAFKA_USERNAME = process.env.KAFKA_USERNAME;
exports.KAFKA_PASSWORD = process.env.KAFKA_PASSWORD;
exports.KAFKA_BROKER = process.env.KAFKA_BROKER;
exports.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
exports.DISCO_LOGO = {
    abuja: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699947957/dpijlhj08ard76zao2uk.jpg",
    benin: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699948367/WhatsApp_Image_2023-11-14_at_08.50.33_zh84o3.jpg",
    eko: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699947957/yz6zowii45nsn3xl9lgv.jpg",
    ibadan: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699948368/WhatsApp_Image_2023-11-14_at_08.50.32_vt9mdc.jpg",
    ikeja: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699947957/hyrk5hn5pqszmdcqsrt5.jpg",
    enugu: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699948368/WhatsApp_Image_2023-11-14_at_08.50.32_1_iu9iwx.jpg",
    jos: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699947957/evry1ddtzu6ot6qrr7km.jpg",
    kano: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699947956/jjvpfvqk9o3pwhrm0ivl.jpg",
    ph: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699947957/i2gsvzisxezdkbcwqvtk.jpg",
    bh: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699947957/i2gsvzisxezdkbcwqvtk.jpg",
    kaduna: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699948178/WhatsApp_Image_2023-11-14_at_08.46.59_szkkyr.jpg",
    yola: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699948178/WhatsApp_Image_2023-11-14_at_08.46.59_1_ckh3ce.jpg",
    ABUJA: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699947957/dpijlhj08ard76zao2uk.jpg",
    BENIN: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699948367/WhatsApp_Image_2023-11-14_at_08.50.33_zh84o3.jpg",
    EKO: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699947957/yz6zowii45nsn3xl9lgv.jpg",
    IBADAN: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699948368/WhatsApp_Image_2023-11-14_at_08.50.32_vt9mdc.jpg",
    IKEJA: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699947957/hyrk5hn5pqszmdcqsrt5.jpg",
    ENUGU: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699948368/WhatsApp_Image_2023-11-14_at_08.50.32_1_iu9iwx.jpg",
    JOS: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699947957/evry1ddtzu6ot6qrr7km.jpg",
    KANO: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699947956/jjvpfvqk9o3pwhrm0ivl.jpg",
    PH: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699947957/i2gsvzisxezdkbcwqvtk.jpg",
    BH: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699947957/i2gsvzisxezdkbcwqvtk.jpg",
    KADUNA: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699948178/WhatsApp_Image_2023-11-14_at_08.46.59_szkkyr.jpg",
    YOLA: "https://res.cloudinary.com/richiepersonaldev/image/upload/v1699948178/WhatsApp_Image_2023-11-14_at_08.46",
};
exports.IRECHARGE_PRIVATE_KEY = process.env.IRECHARGE_PRIVATE_KEY, exports.IRECHARGE_PUBLIC_KEY = process.env.IRECHARGE_PUBLIC_KEY, exports.IRECHARGE_VENDOR_CODE = process.env.IRECHARGE_VENDOR_CODE;
exports.DB_CONFIG = {
    NAME: process.env.DB_NAME,
    USER: process.env.DB_USER,
    PASS: process.env.DB_PASS,
    PORT: parseInt(process.env.DB_PORT),
    DIALECT: process.env.DB_DIALECT,
    HOST: process.env.DB_HOST,
    URL: process.env.DB_URL,
};
exports.PRIMARY_ROLES = ["Admin", "Partner", "TeamMember", "SuperAdmin"];
exports.SU_HOST_EMAIL_1 = process.env.SU_HOST_EMAIL_1, exports.SU_HOST_EMAIL_2 = process.env.SU_HOST_EMAIL_2, exports.SU_HOST_EMAIL_3 = process.env.SU_HOST_EMAIL_3;
