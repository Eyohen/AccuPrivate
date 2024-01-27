"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SU_HOST_EMAIL_3 = exports.SU_HOST_EMAIL_2 = exports.SU_HOST_EMAIL_1 = exports.PRIMARY_ROLES = exports.DB_CONFIG = exports.IRECHARGE_VENDOR_CODE = exports.IRECHARGE_PUBLIC_KEY = exports.IRECHARGE_PRIVATE_KEY = exports.DISCO_LOGO = exports.MAX_REQUERY_PER_VENDOR = exports.SENDGRID_API_KEY = exports.KAFKA_BROKER = exports.KAFKA_PASSWORD = exports.KAFKA_USERNAME = exports.KAFKA_CLIENT_ID = exports.ONESIGNAL_APP_ID = exports.ONESIGNAL_API_KEY = exports.CLOUDINARY_API_SECRET = exports.CLOUDINARY_API_KEY = exports.CLOUDINARY_CLOUD_NAME = exports.CRYPTO_PASSWORD = exports.CRYPTO_IV = exports.API_KEY_SECRET = exports.REDIS_URL = exports.REDIS_PORT = exports.REDIS_PASSWORD = exports.REDIS_HOST = exports.ENCRYPTION_KEY = exports.JWT_SECRET = exports.LOGO_URL = exports.OAUTH_ACCESS_TOKEN = exports.OAUTH_REFRESH_TOKEN = exports.OAUTH_CLIENT_SECRET = exports.OAUTH_CLIENT_ID = exports.EMAIL_HOST_ADDRESS = exports.EMAIL_PORT = exports.EMAIL_HOST = exports.KAFA_LOGS = exports.KAFKA_CA_CERT = exports.KAFKA_ENV = exports.NODE_ENV = exports.DEFAULT_AIRTIME_PROVIDER = exports.DEFAULT_ELECTRICITY_PROVIDER = exports.BUYPOWER_TOKEN = exports.BUYPOWER_URL = exports.BAXI_TOKEN = exports.BAXI_URL = void 0;
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
exports.DEFAULT_AIRTIME_PROVIDER = process.env.DEFAULT_AIRTIME_PROVIDER;
exports.NODE_ENV = process.env.NODE_ENV;
exports.KAFKA_ENV = process.env.KAFKA_ENV;
exports.KAFKA_CA_CERT = process.env.KAFKA_CA_CERT;
exports.KAFA_LOGS = process.env.KAFA_LOGS;
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
exports.MAX_REQUERY_PER_VENDOR = parseInt(process.env.MAX_REQUERY_PER_VENDOR, 10);
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
const discoProductMapping = {
    'ECABEPS': {
        place: 'ABUJA',
        type: 'POSTPAID',
        vendors: {
            Baxi: { discoCode: 'abuja_electric_postpaid', commission: 1.80 },
            BuyPower: { discoCode: 'ABUJA', commission: 1.80 },
            iRecharge: { discoCode: 'AEDC', commission: 1.80 }
        }
    },
    'ECEKEPS': {
        place: 'EKO',
        type: 'POSTPAID',
        vendors: {
            Baxi: { discoCode: 'eko_electric_postpaid', commission: 1.35 },
            BuyPower: { discoCode: 'EKO', commission: 1.50 },
            iRecharge: { discoCode: 'Eko_Postpaid', commission: 1.50 }
        }
    },
    'ECIKEPS': {
        place: 'IKEJA',
        type: 'POSTPAID',
        vendors: {
            Baxi: { discoCode: 'ikeja_electric_postpaid', commission: 1.30 },
            BuyPower: { discoCode: 'IKEJA', commission: 1.40 },
            iRecharge: { discoCode: 'Ikeja_Electric_Bill_Payment', commission: 1.20 }
        }
    },
    'ECJOPPS': {
        place: 'JOS',
        type: 'POSTPAID',
        vendors: {
            Baxi: { discoCode: 'jos_electric_postpaid', commission: 1.80 },
            BuyPower: { discoCode: 'JOS', commission: 1.50 },
            iRecharge: { discoCode: 'Jos_Disco_Postpaid', commission: 1.50 }
        }
    },
    'ECKAEPS': {
        place: 'KADUNA',
        type: 'POSTPAID',
        vendors: {
            Baxi: { discoCode: 'kaduna_electric_postpaid', commission: 2.30 },
            BuyPower: { discoCode: 'KADUNA', commission: 2.00 },
            iRecharge: { discoCode: 'Kaduna_Electricity_Disco_Postpaid', commission: 2.00 }
        }
    },
    'ECEKEPE': {
        place: 'EKO',
        type: 'PREPAID',
        vendors: {
            Baxi: { discoCode: 'eko_electric_prepaid', commission: 1.50 },
            BuyPower: { discoCode: 'EKO', commission: 1.50 },
            iRecharge: { discoCode: 'Eko_Prepaid', commission: 1.35 }
        }
    },
    'ECKDEPS': {
        place: 'KADUNA',
        type: 'POSTPAID',
        vendors: {
            Baxi: { discoCode: 'kaduna_electric_postpaid', commission: 2.30 },
            BuyPower: { discoCode: 'KADUNA', commission: 2.00 },
            iRecharge: { discoCode: 'Kaduna_Electricity_Disco_Postpaid', commission: 2.00 }
        }
    },
    'ECJSEPE': {
        place: 'JOS',
        type: 'PREPAID',
        vendors: {
            Baxi: { discoCode: 'jos_electric_prepaid', commission: 1.80 },
            BuyPower: { discoCode: 'JOS', commission: 1.50 },
            iRecharge: { discoCode: 'Jos_Disco', commission: 1.50 }
        }
    },
    'ECJSEPS': {
        place: 'JOS',
        type: 'POSTPAID',
        vendors: {
            Baxi: { discoCode: 'jos_electric_postpaid', commission: 1.80 },
            BuyPower: { discoCode: 'JOS', commission: 1.50 },
            iRecharge: { discoCode: 'Jos_Disco_Postpaid', commission: 1.50 }
        }
    },
    'ECPHEPE': {
        place: 'PORT-HARCOURT',
        type: 'PREPAID',
        vendors: {
            Baxi: { discoCode: 'portharcourt_electric_prepaid', commission: 1.80 },
            BuyPower: { discoCode: 'PH', commission: 1.50 },
            iRecharge: { discoCode: 'PH_Disco', commission: 1.50 }
        }
    },
    'ECPHEPS': {
        place: 'PORT-HARCOURT',
        type: 'POSTPAID',
        vendors: {
            Baxi: { discoCode: 'portharcourt_electric_postpaid', commission: 1.80 },
            BuyPower: { discoCode: 'PH', commission: 1.50 },
            iRecharge: { discoCode: 'PH_Disco', commission: 1.50 }
        }
    },
    'ECBNEPS': {
        place: 'BENIN',
        type: 'POSTPAID',
        vendors: {
            Baxi: { discoCode: 'ECBNEPS', commission: 2.20 },
            BuyPower: { discoCode: 'BENIN', commission: 2.20 },
            iRecharge: { discoCode: 'Benin', commission: 2.20 }
        }
    },
    'ECBNEPE': {
        place: 'BENIN',
        type: 'PREPAID',
        vendors: {
            Baxi: { discoCode: 'ECBNEPE', commission: 2.20 },
            BuyPower: { discoCode: 'BENIN', commission: 2.20 },
            iRecharge: { discoCode: 'Benin', commission: 2.20 }
        }
    },
    'ECAHBEPS': {
        place: 'YOLA',
        type: 'POSTPAID',
        vendors: {
            Baxi: { discoCode: 'YOLA', commission: 1.80 },
            BuyPower: { discoCode: 'YOLA', commission: 1.80 },
            iRecharge: { discoCode: 'YOLA', commission: 1.20 }
        }
    },
};
