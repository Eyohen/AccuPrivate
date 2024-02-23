import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

const deployed = process.env.DEPLOYED;
const path = deployed ? `/etc/secrets/.env` : `${__dirname}/../.env`;
dotenv.config({ path });

export const MONGO_URI_LOG  = process.env.MONGO_URI_LOG as string;
export const BAXI_URL: string | undefined = process.env.BAXI_URL
export const BAXI_TOKEN: string | undefined = process.env.BAXI_TOKEN
export const BAXI_AGENT_ID: string | undefined = process.env.BAXI_AGENT_ID
export const BUYPOWER_URL: string | undefined = process.env.BUYPOWER_URL
export const BUYPOWER_TOKEN: string | undefined = process.env.BUYPOWER_TOKEN
export const DEFAULT_ELECTRICITY_PROVIDER = process.env.DEFAULT_ELECTRICITY_PROVIDER as 'BAXI' | 'BUYPOWERNG' | 'IRECHARGE'
export const DEFAULT_AIRTIME_PROVIDER = process.env.DEFAULT_AIRTIME_PROVIDER as 'BAXI' | 'BUYPOWERNG' | 'IRECHARGE'
export const DEFAULT_DATA_PROVIDER = process.env.DEFAULT_AIRTIME_PROVIDER as 'BAXI' | 'BUYPOWERNG' | 'IRECHARGE'
export const NODE_ENV = process.env.NODE_ENV as 'development' | 'production' | 'staging'
export const KAFKA_ENV = process.env.KAFKA_ENV as string
export const KAFKA_CA_CERT = process.env.KAFKA_CA_CERT as string
export const KAFA_LOGS = process.env.KAFA_LOGS as string
export const KAFA_REGION = process.env.KAFA_LOGS as string
export const EMAIL_HOST = process.env.EMAIL_HOST as string
export const EMAIL_PORT = parseInt(process.env.EMAIL_PORT as string, 10)
export const EMAIL_HOST_ADDRESS = process.env.EMAIL_HOST_ADDRESS as string
export const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID as string
export const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET as string
export const OAUTH_REFRESH_TOKEN = process.env.OAUTH_REFRESH_TOKEN as string
export const OAUTH_ACCESS_TOKEN = process.env.OAUTH_ACCESS_TOKEN as string
export const LOGO_URL = process.env.LOGO_URL as string
export const JWT_SECRET = process.env.JWT_SECRET as string
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string
export const REDIS_HOST = process.env.REDIS_HOST as string
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD as string
export const REDIS_PORT = parseInt(process.env.REDIS_PORT as string)
export const REDIS_URL = process.env.REDIS_URL as string
export const API_KEY_SECRET = process.env.API_KEY_SECRET as string;
export const CRYPTO_IV = process.env.CRYPTO_IV as string;
export const CRYPTO_PASSWORD = process.env.CRYPTO_PASSWORD as string;
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME as string;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY as string;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET as string;
export const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY as string;
export const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID as string;
export const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID as string;
export const KAFKA_USERNAME = process.env.KAFKA_USERNAME as string;
export const KAFKA_PASSWORD = process.env.KAFKA_PASSWORD as string;
export const KAFKA_BROKER = process.env.KAFKA_BROKER as string;
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY as string;
export const MAX_REQUERY_PER_VENDOR = parseInt(process.env.MAX_REQUERY_PER_VENDOR as string, 10)
export const AFRICASTALKING_API_KEY = process.env.AFRICASTALKING_API_KEY as string;
export const AFRICASTALKING_USERNAME = process.env.AFRICASTALKING_USERNAME as string;
export const AFRICASTALKING_SENDER = process.env.AFRICASTALKING_SENDER as string;

export const DISCO_LOGO = {
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

export const IRECHARGE_PRIVATE_KEY = process.env.IRECHARGE_PRIVATE_KEY as string,
    IRECHARGE_PUBLIC_KEY = process.env.IRECHARGE_PUBLIC_KEY as string,
    IRECHARGE_VENDOR_CODE = process.env.IRECHARGE_VENDOR_CODE as string , 
    IRECHARGE_URL = process.env.IRECHARGE_URL as string;

export const DB_CONFIG = {
    NAME: process.env.DB_NAME as string,
    USER: process.env.DB_USER as string,
    PASS: process.env.DB_PASS as string,
    PORT: parseInt(process.env.DB_PORT as string),
    DIALECT: process.env.DB_DIALECT as "postgres",
    HOST: process.env.DB_HOST as string,
    URL: process.env.DB_URL as string,
};

export const PRIMARY_ROLES = ["Admin", "Partner", "TeamMember", "SuperAdmin"];

export const SU_HOST_EMAIL_1 = process.env.SU_HOST_EMAIL_1 as string,
    SU_HOST_EMAIL_2 = process.env.SU_HOST_EMAIL_2 as string,
    SU_HOST_EMAIL_3 = process.env.SU_HOST_EMAIL_3 as string;


export const discoProductMapping = {
    'ECABEPS': {
        productName: 'ABUJA',
        type: 'POSTPAID',
        vendors: {
            BAXI: { discoCode: 'abuja_electric_postpaid', commission: 1.80 },
            BUYPOWERNG: { discoCode: 'ABUJA', commission: 1.80 },
            IRECHARGE: { discoCode: 'AEDC', commission: 1.80 }
        }
    },
    'ECEKEPS': {
        productName: 'EKO',
        type: 'POSTPAID',
        vendors: {
            BAXI: { discoCode: 'eko_electric_postpaid', commission: 1.35 },
            BUYPOWERNG: { discoCode: 'EKO', commission: 1.50 },
            IRECHARGE: { discoCode: 'Eko_Postpaid', commission: 1.50 }
        }
    },
    'ECIKEPS': {
        productName: 'IKEJA',
        type: 'POSTPAID',
        vendors: {
            BAXI: { discoCode: 'ikeja_electric_postpaid', commission: 1.30 },
            BUYPOWERNG: { discoCode: 'IKEJA', commission: 1.40 },
            IRECHARGE: { discoCode: 'Ikeja_Electric_Bill_Payment', commission: 1.20 }
        }
    },
    'ECJOPPS': {
        productName: 'JOS',
        type: 'POSTPAID',
        vendors: {
            BAXI: { discoCode: 'jos_electric_postpaid', commission: 1.80 },
            BUYPOWERNG: { discoCode: 'JOS', commission: 1.50 },
            IRECHARGE: { discoCode: 'Jos_Disco_Postpaid', commission: 1.50 }
        }
    },
    'ECKAEPS': {
        productName: 'KADUNA',
        type: 'POSTPAID',
        vendors: {
            BAXI: { discoCode: 'kaduna_electric_postpaid', commission: 2.30 },
            BUYPOWERNG: { discoCode: 'KADUNA', commission: 2.00 },
            IRECHARGE: { discoCode: 'Kaduna_Electricity_Disco_Postpaid', commission: 2.00 }
        }
    },
    'ECEKEPE': {
        productName: 'EKO',
        type: 'PREPAID',
        vendors: {
            BAXI: { discoCode: 'eko_electric_prepaid', commission: 1.50 },
            BUYPOWERNG: { discoCode: 'EKO', commission: 1.50 },
            IRECHARGE: { discoCode: 'Eko_Prepaid', commission: 1.35 }
        }
    },
    'ECKDEPS': {
        productName: 'KADUNA',
        type: 'POSTPAID',
        vendors: {
            BAXI: { discoCode: 'kaduna_electric_postpaid', commission: 2.30 },
            BUYPOWERNG: { discoCode: 'KADUNA', commission: 2.00 },
            IRECHARGE: { discoCode: 'Kaduna_Electricity_Disco_Postpaid', commission: 2.00 }
        }
    },
    'ECJSEPE': {
        productName: 'JOS',
        type: 'PREPAID',
        vendors: {
            BAXI: { discoCode: 'jos_electric_prepaid', commission: 1.80 },
            BUYPOWERNG: { discoCode: 'JOS', commission: 1.50 },
            IRECHARGE: { discoCode: 'Jos_Disco_Prepaid', commission: 1.50 }
        }
    },
    'ECJSEPS': {
        productName: 'JOS',
        type: 'POSTPAID',
        vendors: {
            BAXI: { discoCode: 'jos_electric_postpaid', commission: 1.80 },
            BUYPOWERNG: { discoCode: 'JOS', commission: 1.50 },
            IRECHARGE: { discoCode: 'Jos_Disco_Postpaid', commission: 1.50 }
        }
    },
    'ECPHEPE': {
        productName: 'PORT-HARCOURT',
        type: 'PREPAID',
        vendors: {
            BAXI: { discoCode: 'portharcourt_electric_prepaid', commission: 1.80 },
            BUYPOWERNG: { discoCode: 'PH', commission: 1.50 },
            IRECHARGE: { discoCode: 'PH_Disco', commission: 1.50 }
        }
    },
    'ECPHEPS': {
        productName: 'PORT-HARCOURT',
        type: 'POSTPAID',
        vendors: {
            BAXI: { discoCode: 'portharcourt_electric_postpaid', commission: 1.80 },
            BUYPOWERNG: { discoCode: 'PH', commission: 1.50 },
            IRECHARGE: { discoCode: 'PH_Disco', commission: 1.50 }
        }
    },
    'ECBNEPS': {
        productName: 'BENIN',
        type: 'POSTPAID',
        vendors: {
            BAXI: { discoCode: 'ECBNEPS', commission: 2.20 },
            BUYPOWERNG: { discoCode: 'BENIN', commission: 2.20 },
            IRECHARGE: { discoCode: 'Benin', commission: 2.20 }
        }
    },
    'ECBNEPE': {
        productName: 'BENIN',
        type: 'PREPAID',
        vendors: {
            BAXI: { discoCode: 'ECBNEPE', commission: 2.20 },
            BUYPOWERNG: { discoCode: 'BENIN', commission: 2.20 },
            IRECHARGE: { discoCode: 'Benin', commission: 2.20 }
        }
    },
    'ECAHBEPS': {
        productName: 'YOLA',
        type: 'POSTPAID',
        vendors: {
            BAXI: { discoCode: 'YOLA', commission: 1.80 },
            BUYPOWERNG: { discoCode: 'YOLA', commission: 1.80 },
            IRECHARGE: { discoCode: 'YOLA', commission: 1.20 }
        }
    },
} as const

export const SEED = {
    ELECTRICITY: {
        'ECABEPS': {
            productName: 'ABUJA',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'abuja_electric_postpaid', commission: 1.20, bonus: 0 },
                BUYPOWERNG: { discoCode: 'ABUJA', commission: 1.80, bonus: 0 },
                IRECHARGE: { discoCode: 'AEDC_Postpaid', commission: 2.00, bonus: 0 },
            }
        },
        'ECEKEPS': {
            productName: 'EKO',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'eko_electric_postpaid', commission: 1.50, bonus: 0 },
                BUYPOWERNG: { discoCode: 'EKO', commission: 1.50, bonus: 0 },
                IRECHARGE: { discoCode: 'Eko_Postpaid', commission: 1.35, bonus: 70 },
            }
        },
        'ECIKEPS': {
            productName: 'IKEJA',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'ikeja_electric_postpaid', commission: 1.0, bonus: 0 },
                BUYPOWERNG: { discoCode: 'IKEJA', commission: 1.40, bonus: 0 },
                IRECHARGE: { discoCode: 'Ikeja_Electric_Bill_Payment', commission: 1.0, bonus: 60 },
            }
        },
        'ECJSEPS': {
            productName: 'JOS',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'jos_electric_postpaid', commission: 1.0, bonus: 0 },
                BUYPOWERNG: { discoCode: 'JOS', commission: 1.80, bonus: 0 },
                IRECHARGE: { discoCode: 'Jos_Disco_Postpaid', commission: 1.50, bonus: 0 },
            }
        },
        'ECJSEPE': {
            productName: 'JOS',
            type: 'PREPAID',
            vendors: {
                BAXI: { discoCode: 'jos_electric_prepaid', commission: 1.0, bonus: 0 },
                BUYPOWERNG: { discoCode: 'JOS', commission: 1.80, bonus: 0 },
                IRECHARGE: { discoCode: 'Jos_Disco_Prepaid', commission: 1.50, bonus: 60 },
            }
        },
        'ECKDEPS': {
            productName: 'KADUNA',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'kaduna_electric_prepaid', commission: 1.20, bonus: 0 },
                BUYPOWERNG: { discoCode: 'KADUNA', commission: 2.30, bonus: 0 },
                IRECHARGE: { discoCode: 'Kaduna_Electricity_Disco_Prepaid', commission: 2.0, bonus: 0 },
            }
        },
        'ECEKEPE': {
            productName: 'EKO',
            type: 'PREPAID',
            vendors: {
                BAXI: { discoCode: 'eko_electric_prepaid', commission: 1.50, bonus: 0 },
                BUYPOWERNG: { discoCode: 'EKO', commission: 1.50, bonus: 0 },
                IRECHARGE: { discoCode: 'Eko_Prepaid', commission: 1.35, bonus: 70 },
            }
        },
        'ECKDEPE': {
            productName: 'KADUNA',
            type: 'PREPAID',
            vendors: {
                BAXI: { discoCode: 'kaduna_electric_prepaid', commission: 1.20, bonus: 0 },
                BUYPOWERNG: { discoCode: 'KADUNA', commission: 2.30, bonus: 0 },
                IRECHARGE: { discoCode: 'Kaduna_Electricity_Disco', commission: 2.00, bonus: 70 },
            }
        },
     
        'ECPHEPE': {
            productName: 'PORTHARCOURT',
            type: 'PREPAID',
            vendors: {
                BAXI: { discoCode: 'portharcourt_electric_prepaid', commission: 1.20, bonus: 0 },
                BUYPOWERNG: { discoCode: 'PH', commission: 1.80, bonus: 0 },
                IRECHARGE: { discoCode: 'PhED_Electricity', commission: 1.50, bonus: 50 },
            }
        },
        'ECPHEPS': {
            productName: 'PORTHARCOURT',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'portharcourt_electric_postpaid', commission: 1.20, bonus: 0 },
                BUYPOWERNG: { discoCode: 'PH', commission: 1.80, bonus: 0 },
                IRECHARGE: { discoCode: 'PH_Disco', commission: 1.50, bonus: 50 },
            }
        },
        // 'ECBNEPS': {
        //     productName: 'BENIN',
        //     type: 'POSTPAID',
        //     vendors: {
        //         // BAXI: { discoCode: 'ECBNEPS', commission: 2.20, bonus: 0 },
        //         BUYPOWERNG: { discoCode: 'BENIN', commission: 2.20, bonus: 0 },
        //         IRECHARGE: { discoCode: 'BEDC_Postpaid', commission: 0.0, bonus: 0 },
        //     }
        // },
        // 'ECBNEPE': {
        //     productName: 'BENIN',
        //     type: 'PREPAID',
        //     vendors: {
        //         // BAXI: { discoCode: 'ECBNEPE', commission: 2.20, bonus: 0 },
        //         BUYPOWERNG: { discoCode: 'BENIN', commission: 2.20, bonus: 0 },
        //         IRECHARGE: { discoCode: 'BEDC', commission: 0.0, bonus: 0 },
        //     }
        // },
        'ECEGEPE': {
            productName: 'ENUGU',
            type: 'PREPAID',
            vendors: {
                BAXI: { discoCode: 'enugu_electric_prepaid', commission: 1.80, bonus: 0 },
                BUYPOWERNG: { discoCode: 'ENUGU', commission: 2.20, bonus: 0 },
                IRECHARGE: { discoCode: 'Enugu_Electricity_Distribution_Prepaid', commission: 1.50, bonus: 50 },
            }
        },
        'ECEGEPS': {
            productName: 'ENUGU',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'enugu_electric_postpaid', commission: 1.80, bonus: 0 },
                BUYPOWERNG: { discoCode: 'ENUGU', commission: 2.20, bonus: 0 },
                IRECHARGE: { discoCode: 'Enugu_Electricity_Distribution_Postpaid', commission: 1.50, bonus: 50 },
            }
        },
        'ECIKEPE': {
            productName: 'IKEJA',
            type: 'PREPAID',
            vendors: {
                BAXI: { discoCode: 'ikeja_electric_prepaid', commission: 1.0, bonus: 0 },
                BUYPOWERNG: { discoCode: 'IKEJA', commission: 1.40, bonus: 0 },
                IRECHARGE: { discoCode: 'Ikeja_Token_Purchase', commission: 1.0, bonus: 60 },
            }
        },
        'ECABEPE': {
            productName: 'ABUJA',
            type: 'PREPAID',
            vendors: {
                BAXI: { discoCode: 'abuja_electric_prepaid', commission: 1.20, bonus: 0 },
                BUYPOWERNG: { discoCode: 'ABUJA', commission: 1.80, bonus: 0 },
                IRECHARGE: { discoCode: 'AEDC', commission: 2.00, bonus: 0 },
            }
        },
        // 'ECAAEPE': {
        //     productName: 'ABA',
        //     type: 'PREPAID',
        //     vendors: {
        //         //BAXI: { discoCode: 'abuja_electric_prepaid', commission: 2.30, bonus: 0 },
        //         BUYPOWERNG: { discoCode: 'ABA', commission: 0.0, bonus: 0 },
        //         IRECHARGE: { discoCode: 'Aba_Power_Prepaid', commission: 0.0, bonus: 0 },
        //     }
        // },
        // 'ECAAEPS': {
        //     productName: 'ABA',
        //     type: 'POSTPAID',
        //     vendors: {
        //         //BAXI: { discoCode: 'abuja_electric_prepaid', commission: 2.30, bonus: 0 },
        //         BUYPOWERNG: { discoCode: 'ABA', commission: 0.0, bonus: 0 },
        //         IRECHARGE: { discoCode: 'Aba_Power_Postpaid', commission: 0.0, bonus: 0 },
        //     }
        // },
        'ECIBEPE': {
            productName: 'IBADAN',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'ibadan_electric_postpaid', commission: 0.6, bonus: 0 },
                BUYPOWERNG: { discoCode: 'IBADAN', commission: 1.0, bonus: 0 },
                IRECHARGE: { discoCode: 'Ibadan_Disco_Postpaid', commission: 0.0, bonus: 0 },
            }
        },
        'ECIBEPS': {
            productName: 'IBADAN',
            type: 'PREPAID',
            vendors: {
                BAXI: { discoCode: 'ibadan_electric_prepaid', commission: 0.6, bonus: 0 },
                BUYPOWERNG: { discoCode: 'IBADAN', commission: 1.0, bonus: 0 },
                IRECHARGE: { discoCode: 'Ibadan_Disco_Prepaid', commission: 1.30, bonus: 70 },
            }
        },
        'ECKAEPS': {
            productName: 'KANO',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'kedco_electric_postpaid', commission: 1.0, bonus: 0 },
                BUYPOWERNG: { discoCode: 'KANO', commission: 1.8, bonus: 0 },
                IRECHARGE: { discoCode: 'Kano_Electricity_Disco_Postpaid', commission: 1.50, bonus: 0 },
            }
        },
        'ECKAEPE': {
            productName: 'KANO',
            type: 'PREPAID',
            vendors: {
                BAXI: { discoCode: 'kedco_electric_prepaid', commission: 1.0, bonus: 0 },
                BUYPOWERNG: { discoCode: 'KANO', commission: 1.8, bonus: 0 },
                IRECHARGE: { discoCode: 'Kano_Electricity_Disco', commission: 1.50, bonus: 0 },
            }
        },
    },
    AIRTIME: {
        'TCMTNVT': {
            productName: 'MTN',
            type: '',
            vendors: {
                BAXI: { discoCode: 'mtn', commission: 2.0, bonus: 0 },
                BUYPOWERNG: { discoCode: 'MTN', commission: 0, bonus: 0 },
                IRECHARGE: { discoCode: 'MTN', commission: 2.50, bonus: 0 },
            }
        },
        'TCGLOVT': {
            productName: 'GLO',
            type: '',
            vendors: {
                BAXI: { discoCode: 'glo', commission: 3.50, bonus: 0 },
                BUYPOWERNG: { discoCode: 'GLO', commission: 0, bonus: 0 },
                IRECHARGE: { discoCode: 'Glo', commission: 4.0, bonus: 0 },
            }
        },
        'TC9MBVT': {
            productName: '9MOBILE',
            type: '',
            vendors: {
                BAXI: { discoCode: '9mobile', commission: 3.5, bonus: 0 },
                BUYPOWERNG: { discoCode: '9MOBILE', commission: 0, bonus: 0 },
                IRECHARGE: { discoCode: '9MOBILE', commission: 3.5, bonus: 0 },
            }
        },
        'TCATLVT': {
            productName: 'AIRTEL',
            type: '',
            vendors: {
                BAXI: { discoCode: 'airtel', commission: 2.0, bonus: 0 },
                BUYPOWERNG: { discoCode: 'AIRTEL', commission: 0, bonus: 0 },
                IRECHARGE: { discoCode: 'Airtel', commission: 3.0, bonus: 0 },
            }
        },
    },
} as const;

export const SCHEMADATA = {
    BUYPOWERNG: {
        AIRTIME: {
            paymentType: 'B2B',
            vendType: 'PREPAID',
            vertical: 'VTU',
        },
        DATA: {
            paymentType: 'B2B',
            vendType: 'PREPAID',
            vertical: 'DATA',
        },
        CABLE: {
            paymentType: 'B2B',
            vendType: 'PREPAID',
            vertical: 'CABLE',
        },
        ELECTRICITY: {
            paymentType: 'B2B',
            vendType: 'PREPAID',
            vertical: 'ELECTRICITY',
        },
    },
    IRECHARGE: {
        AIRTIME: {
            vendor_code: "23126C8537",
            response_format: "json",
        },
        DATA: {
            vendor_code: "23126C8537",
            response_format: "json",
        },
        CABLE: {
            vendor_code: "23126C8537",
            response_format: "json",
        },
        ELECTRICITY: {
            vendor_code: "23126C8537",
            response_format: "json",
        },
    },
    BAXI: {
        AIRTIME: {
            agentId: BAXI_AGENT_ID
        },
        DATA: {
            agentId: BAXI_AGENT_ID
        },
        CABLE: {
            agentId: BAXI_AGENT_ID
        },
        ELECTRICITY: {
            agentId: BAXI_AGENT_ID
        },
    },
} as const

export const SEED_DATA = {
    IRECHARGE:{
        MTN: [
            {
                "code": "1",
                "title": "MTN D-MFIN-5-Combo-97 for Xtradata 20000 Monthly Bundle",
                "price": "20000",
                "validity": "Xtradata 20000 Monthly Bundle"
            },
            {
                "code": "2",
                "title": "MTN D-MFIN-5-Combo-96 for Xtradata 15000 Monthly Bundle",
                "price": "15000",
                "validity": "Xtradata 15000 Monthly Bundle"
            },
            {
                "code": "3",
                "title": "MTN D-MFIN-5-Combo-95 for Xtradata 10000 Monthly Bundle",
                "price": "10000",
                "validity": "Xtradata 10000 Monthly Bundle"
            },
            {
                "code": "4",
                "title": "MTN D-MFIN-5-Combo-94 for Xtradata 5000 Monthly Bundle",
                "price": "5000",
                "validity": "Xtradata 5000 Monthly Bundle"
            },
            {
                "code": "5",
                "title": "MTN D-MFIN-5-Combo-93 for Xtradata 2000 Monthly Bundle",
                "price": "2000",
                "validity": "Xtradata 2000 Monthly Bundle"
            },
            {
                "code": "6",
                "title": "MTN D-MFIN-5-Combo-92 for Xtradata 1000 Monthly Bundle",
                "price": "1000",
                "validity": "Xtradata 1000 Monthly Bundle"
            },
            {
                "code": "7",
                "title": "MTN D-MFIN-5-Combo-91 for Xtradata 500 Weekly Bundle",
                "price": "500",
                "validity": "Xtradata 500 Weekly Bundle"
            },
            {
                "code": "8",
                "title": "MTN D-MFIN-5-Combo-89 for Xtratalk 20000 Monthly Bundle",
                "price": "20000",
                "validity": "Xtratalk 20000 Monthly Bundle"
            },
            {
                "code": "9",
                "title": "MTN D-MFIN-5-Combo-88 for Xtratalk 15000 Monthly Bundle",
                "price": "15000",
                "validity": "Xtratalk 15000 Monthly Bundle"
            },
            {
                "code": "10",
                "title": "MTN D-MFIN-5-Combo-87 for Xtratalk 10000 Monthly Bundle",
                "price": "10000",
                "validity": "Xtratalk 10000 Monthly Bundle"
            },
            {
                "code": "11",
                "title": "MTN D-MFIN-5-Combo-86 for Xtratalk 5000 Monthly Bundle",
                "price": "5000",
                "validity": "Xtratalk 5000 Monthly Bundle"
            },
            {
                "code": "12",
                "title": "MTN D-MFIN-5-Combo-85 for Xtratalk 2000 Monthly Bundle",
                "price": "2000",
                "validity": "Xtratalk 2000 Monthly Bundle"
            },
            {
                "code": "13",
                "title": "MTN D-MFIN-5-Combo-84 for Xtratalk 1000 Monthly Bundle",
                "price": "1000",
                "validity": "Xtratalk 1000 Monthly Bundle"
            },
            {
                "code": "14",
                "title": "MTN D-MFIN-5-Combo-83 for Xtratalk 500 Weekly Bundle",
                "price": "500",
                "validity": "Xtratalk 500 Weekly Bundle"
            },
            {
                "code": "15",
                "title": "MTN D-MFIN-5-Combo-73 for Xtratalk 300 Weekly Bundle\r\nXtratalk 300 Weekly Bundle",
                "price": "300",
                "validity": "Xtratalk 300 Weekly Bundle\r\nXtratalk 300 Weekly Bundle"
            },
            {
                "code": "16",
                "title": "MTN D-MFIN-5-Combo-1588 for Xtradata 300 Weekly Bundle",
                "price": "300",
                "validity": "Xtradata 300 Weekly Bundle"
            },
            {
                "code": "17",
                "title": "MTN D-MFIN-5-Combo-1587 for Xtratalk 200 3days Bundle\r\nXtratalk 200 3days Bundle",
                "price": "200",
                "validity": "Xtratalk 200 3days Bundle\r\nXtratalk 200 3days Bundle"
            },
            {
                "code": "18",
                "title": "MTN D-MFIN-5-7GB-A for 7GB Weekly Bundle",
                "price": "2000",
                "validity": "7GB Weekly Bundle"
            },
            {
                "code": "19",
                "title": "MTN D-MFIN-5-774 for 1TB SME 3-Months Plan",
                "price": "350000",
                "validity": "1TB SME 3-Months Plan"
            },
            {
                "code": "20",
                "title": "MTN D-MFIN-5-773 for 165GB SME 2-Months Plan",
                "price": "50000",
                "validity": "165GB SME 2-Months Plan"
            },
            {
                "code": "21",
                "title": "MTN D-MFIN-5-755 for 400GB Yearly Plan",
                "price": "120000",
                "validity": "400GB Yearly Plan"
            },
            {
                "code": "22",
                "title": "MTN D-MFIN-5-746 for 120GB Monthly Plan + 80mins.",
                "price": "22000",
                "validity": "120GB Monthly Plan + 80mins."
            },
            {
                "code": "23",
                "title": "MTN D-MFIN-5-745 for 10GB+2GB YouTube Night+300MB YouTube Music + 20mins.",
                "price": "3500",
                "validity": "10GB+2GB YouTube Night+300MB YouTube Music + 20mins."
            },
            {
                "code": "24",
                "title": "MTN D-MFIN-5-744 for 8GB+2GB YouTube Night+200MB YouTube Music + 15mins.",
                "price": "3000",
                "validity": "8GB+2GB YouTube Night+200MB YouTube Music + 15mins."
            },
            {
                "code": "25",
                "title": "MTN D-MFIN-5-743 for 5GB Weekly Plan",
                "price": "1500",
                "validity": "5GB Weekly Plan"
            },
            {
                "code": "26",
                "title": "MTN D-MFIN-5-742 for 1GB Weekly Plan + FREE 1GB for YouTube and 100MB for YouTube Music + 5mins.",
                "price": "600",
                "validity": "1GB Weekly Plan + FREE 1GB for YouTube and 100MB for YouTube Music + 5mins."
            },
            {
                "code": "27",
                "title": "MTN D-MFIN-5-600 for 2.5GB 2-Day Plan",
                "price": "600",
                "validity": "2.5GB 2-Day Plan"
            },
            {
                "code": "28",
                "title": "MTN D-MFIN-5-422 for 25GB SME Monthly Plan",
                "price": "10000",
                "validity": "25GB SME Monthly Plan"
            },
            {
                "code": "29",
                "title": "MTN D-MFIN-5-3GB-A for 3GB 2-Days Bundle",
                "price": "800",
                "validity": "3GB 2-Days Bundle"
            },
            {
                "code": "30",
                "title": "MTN D-MFIN-5-360GB for 360GB SME 3-Months Plan",
                "price": "100000",
                "validity": "360GB SME 3-Months Plan"
            },
            {
                "code": "31",
                "title": "MTN D-MFIN-5-307 for DataPlan 100MB Daily",
                "price": "100",
                "validity": "DataPlan 100MB Daily"
            },
            {
                "code": "32",
                "title": "MTN D-MFIN-5-278 for 75GB Monthly Plan + 40mins.",
                "price": "16000",
                "validity": "75GB Monthly Plan + 40mins."
            },
            {
                "code": "33",
                "title": "MTN D-MFIN-5-276 for 1GB Daily Plan + 3mins.",
                "price": "350",
                "validity": "1GB Daily Plan + 3mins."
            },
            {
                "code": "34",
                "title": "MTN D-MFIN-5-212 for 25GB+2GB YouTube Night + 25mins.",
                "price": "6500",
                "validity": "25GB+2GB YouTube Night + 25mins."
            },
            {
                "code": "35",
                "title": "MTN D-MFIN-5-211 for 3GB+2GB YouTube Night+200MB YouTube Music + 5mins.",
                "price": "1600",
                "validity": "3GB+2GB YouTube Night+200MB YouTube Music + 5mins."
            },
            {
                "code": "36",
                "title": "MTN D-MFIN-5-210 for 160GB 2-Month Plan",
                "price": "30000",
                "validity": "160GB 2-Month Plan"
            },
            {
                "code": "37",
                "title": "MTN D-MFIN-5-204 for 1-Year Plan",
                "price": "450000",
                "validity": "1-Year Plan"
            },
            {
                "code": "38",
                "title": "MTN D-MFIN-5-203 for 2.5TB Yearly Plan",
                "price": "250000",
                "validity": "2.5TB Yearly Plan"
            },
            {
                "code": "39",
                "title": "MTN D-MFIN-5-202 for 1 year Plan",
                "price": "100000",
                "validity": "1 year Plan"
            },
            {
                "code": "40",
                "title": "MTN D-MFIN-5-201 for 600GB 3-Month Plan",
                "price": "75000",
                "validity": "600GB 3-Month Plan"
            },
            {
                "code": "41",
                "title": "MTN D-MFIN-5-200 for 400GB 3-Month Plan",
                "price": "50000",
                "validity": "400GB 3-Month Plan"
            },
            {
                "code": "42",
                "title": "MTN D-MFIN-5-199 for 100GB 2-Month Plan",
                "price": "20000",
                "validity": "100GB 2-Month Plan"
            },
            {
                "code": "43",
                "title": "MTN D-MFIN-5-198 for 40GB Monthly Plan + 40mins.",
                "price": "11000",
                "validity": "40GB Monthly Plan + 40mins."
            },
            {
                "code": "44",
                "title": "MTN D-MFIN-5-197 for 20GB+2GB YouTube Night+300MB YouTube Music + 25mins.",
                "price": "5500",
                "validity": "20GB+2GB YouTube Night+300MB YouTube Music + 25mins."
            },
            {
                "code": "45",
                "title": "MTN D-MFIN-5-196 for 12GB+2GB YouTube Night + 25mins.",
                "price": "4000",
                "validity": "12GB+2GB YouTube Night + 25mins."
            },
            {
                "code": "46",
                "title": "MTN D-MFIN-5-195 for 4GB+2GB YouTube Night+200MB YouTube Music + 10mins.",
                "price": "2000",
                "validity": "4GB+2GB YouTube Night+200MB YouTube Music + 10mins."
            },
            {
                "code": "47",
                "title": "MTN D-MFIN-5-192 for Data Plan 200MB 3-Day Plan",
                "price": "200",
                "validity": "Data Plan 200MB 3-Day Plan"
            },
            {
                "code": "48",
                "title": "MTN D-MFIN-5-15AD for 1.2GB Monthly Plan + FREE 2GB for YouTube and 200MB for YouTube Music + 5mins.",
                "price": "1000",
                "validity": "1.2GB Monthly Plan + FREE 2GB for YouTube and 200MB for YouTube Music + 5mins."
            },
            {
                "code": "49",
                "title": "MTN D-MFIN-5-1596 for 27GB Monthly Plan + 25mins.",
                "price": "6500",
                "validity": "27GB Monthly Plan + 25mins."
            },
            {
                "code": "50",
                "title": "MTN D-MFIN-5-1595 for 22GB Monthly Plan + 25mins.",
                "price": "5500",
                "validity": "22GB Monthly Plan + 25mins."
            },
            {
                "code": "51",
                "title": "MTN D-MFIN-5-1594 for 13GB Monthly Plan + 25mins.",
                "price": "4000",
                "validity": "13GB Monthly Plan + 25mins."
            },
            {
                "code": "52",
                "title": "MTN D-MFIN-5-1593 for 11GB Monthly Plan + 20mins.",
                "price": "3500",
                "validity": "11GB Monthly Plan + 20mins."
            },
            {
                "code": "53",
                "title": "MTN D-MFIN-5-153 for 1.5GB+2.4GB YouTube Night+3hr-200MB-YouTube Weekly + 5mins.",
                "price": "1200",
                "validity": "1.5GB+2.4GB YouTube Night+3hr-200MB-YouTube Weekly + 5mins."
            },
            {
                "code": "54",
                "title": "MTN D-MFIN-5-13500 for 35GB SME Monthly Plan",
                "price": "13500",
                "validity": "35GB SME Monthly Plan"
            }
        ],
        GLO:[
            {
                "code": "111",
                "title": "Glo D-MFIN-6-DATA400 for Day Plan 1 days",
                "price": "50",
                "validity": "Day Plan 1 days"
            },
            {
                "code": "112",
                "title": "Glo D-MFIN-6-DATA401 for Day Plan 1 days",
                "price": "100",
                "validity": "Day Plan 1 days"
            },
            {
                "code": "113",
                "title": "Glo D-MFIN-6-DATA402 for Day Plan 2 days",
                "price": "200",
                "validity": "Day Plan 2 days"
            },
            {
                "code": "114",
                "title": "Glo D-MFIN-6-DATA403 for Weekly Plan 14 days",
                "price": "500",
                "validity": "Weekly Plan 14 days"
            },
            {
                "code": "115",
                "title": "Glo D-MFIN-6-DATA404 for Monthly Plan 30 days",
                "price": "1000",
                "validity": "Monthly Plan 30 days"
            },
            {
                "code": "116",
                "title": "Glo D-MFIN-6-DATA433 for Monthly Plan 30 days",
                "price": "1500",
                "validity": "Monthly Plan 30 days"
            },
            {
                "code": "117",
                "title": "Glo D-MFIN-6-DATA405 for Monthly Plan 30 days",
                "price": "2000",
                "validity": "Monthly Plan 30 days"
            },
            {
                "code": "118",
                "title": "Glo D-MFIN-6-DATA406 for Monthly Plan 30 days",
                "price": "2500",
                "validity": "Monthly Plan 30 days"
            },
            {
                "code": "119",
                "title": "Glo D-MFIN-6-DATA407 for Monthly Plan 30 days",
                "price": "3000",
                "validity": "Monthly Plan 30 days"
            },
            {
                "code": "120",
                "title": "Glo D-MFIN-6-DATA408 for Monthly Plan 30 days",
                "price": "4000",
                "validity": "Monthly Plan 30 days"
            },
            {
                "code": "121",
                "title": "Glo D-MFIN-6-DATA409 for Monthly Plan 30 days",
                "price": "5000",
                "validity": "Monthly Plan 30 days"
            },
            {
                "code": "122",
                "title": "Glo D-MFIN-6-DATA410 for Monthly Plan 30 days",
                "price": "8000",
                "validity": "Monthly Plan 30 days"
            },
            {
                "code": "123",
                "title": "Glo D-MFIN-6-DATA430 for Monthly Plan 30 days",
                "price": "10000",
                "validity": "Monthly Plan 30 days"
            },
            {
                "code": "124",
                "title": "Glo D-MFIN-6-DATA411 for Monthly Plan 30 days",
                "price": "15000",
                "validity": "Monthly Plan 30 days"
            },
            {
                "code": "125",
                "title": "Glo D-MFIN-6-DATA412 for Monthly Plan 30 days",
                "price": "18000",
                "validity": "Monthly Plan 30 days"
            },
            {
                "code": "126",
                "title": "Glo D-MFIN-6-DATA432 for Monthly Plan 30 days",
                "price": "20000",
                "validity": "Monthly Plan 30 days"
            },
            {
                "code": "127",
                "title": "Glo D-MFIN-6-DATA15 for Night Plan 1 days",
                "price": "25",
                "validity": "Night Plan 1 days"
            },
            {
                "code": "128",
                "title": "Glo D-MFIN-6-DATA30 for Night Plan 1 days",
                "price": "50",
                "validity": "Night Plan 1 days"
            },
            {
                "code": "129",
                "title": "Glo D-MFIN-6-DATA31 for Night Plan 5 days",
                "price": "100",
                "validity": "Night Plan 5 days"
            },
            {
                "code": "130",
                "title": "Glo D-MFIN-6-DATA35 for Special Plan 1 days",
                "price": "300",
                "validity": "Special Plan 1 days"
            },
            {
                "code": "131",
                "title": "Glo D-MFIN-6-DATA36 for Special Plan 2 days",
                "price": "500",
                "validity": "Special Plan 2 days"
            },
            {
                "code": "132",
                "title": "Glo D-MFIN-6-DATA24 for Special Plan 7 days",
                "price": "1500",
                "validity": "Special Plan 7 days"
            },
            {
                "code": "133",
                "title": "Glo D-MFIN-6-DATA14 for Weekend Plan 2 (Sat & Sun) days",
                "price": "500",
                "validity": "Weekend Plan 2 (Sat & Sun) days"
            },
            {
                "code": "134",
                "title": "Glo D-MFIN-6-DATA37 for Weekend Plan 1 (Sun) days",
                "price": "200",
                "validity": "Weekend Plan 1 (Sun) days"
            },
            {
                "code": "135",
                "title": "Glo D-MFIN-6-DATA434 for Mega Plan 30 days",
                "price": "30000",
                "validity": "Mega Plan 30 days"
            },
            {
                "code": "136",
                "title": "Glo D-MFIN-6-DATA435 for Mega Plan 30 days",
                "price": "36000",
                "validity": "Mega Plan 30 days"
            },
            {
                "code": "137",
                "title": "Glo D-MFIN-6-DATA436 for Mega Plan 90 days",
                "price": "50000",
                "validity": "Mega Plan 90 days"
            },
            {
                "code": "138",
                "title": "Glo D-MFIN-6-DATA437 for Mega Plan 120 days",
                "price": "60000",
                "validity": "Mega Plan 120 days"
            },
            {
                "code": "139",
                "title": "Glo D-MFIN-6-DATA438 for Mega Plan 120 days",
                "price": "75000",
                "validity": "Mega Plan 120 days"
            },
            {
                "code": "140",
                "title": "Glo D-MFIN-6-DATA439 for Mega Plan 365 days",
                "price": "100000",
                "validity": "Mega Plan 365 days"
            },
            {
                "code": "141",
                "title": "Glo D-MFIN-6-DATA780 for Glo TV 3 days",
                "price": "150",
                "validity": "Glo TV 3 days"
            },
            {
                "code": "142",
                "title": "Glo D-MFIN-6-DATA781 for Glo TV 7 days",
                "price": "450",
                "validity": "Glo TV 7 days"
            },
            {
                "code": "143",
                "title": "Glo D-MFIN-6-DATA782 for Glo TV 30 days",
                "price": "1400",
                "validity": "Glo TV 30 days"
            },
            {
                "code": "144",
                "title": "Glo D-MFIN-6-DATA783 for Glo TV 7 days",
                "price": "900",
                "validity": "Glo TV 7 days"
            },
            {
                "code": "145",
                "title": "Glo D-MFIN-6-DATA784 for Glo TV 30 days",
                "price": "3200",
                "validity": "Glo TV 30 days"
            },
            {
                "code": "146",
                "title": "Glo D-MFIN-6-DATA850 for Social Plan 1 days",
                "price": "25",
                "validity": "Social Plan 1 days"
            },
            {
                "code": "147",
                "title": "Glo D-MFIN-6-DATA851 for Social Plan 7 days",
                "price": "50",
                "validity": "Social Plan 7 days"
            },
            {
                "code": "148",
                "title": "Glo D-MFIN-6-DATA852 for Social Plan 30 days",
                "price": "100",
                "validity": "Social Plan 30 days"
            },
            {
                "code": "149",
                "title": "Glo D-MFIN-6-DATA853 for Social Plan 1 days",
                "price": "25",
                "validity": "Social Plan 1 days"
            },
            {
                "code": "150",
                "title": "Glo D-MFIN-6-DATA854 for Social Plan 7 days",
                "price": "50",
                "validity": "Social Plan 7 days"
            },
            {
                "code": "151",
                "title": "Glo D-MFIN-6-DATA855 for Social Plan 30 days",
                "price": "100",
                "validity": "Social Plan 30 days"
            },
            {
                "code": "152",
                "title": "Glo D-MFIN-6-DATA856 for Social Plan 1 days",
                "price": "25",
                "validity": "Social Plan 1 days"
            },
            {
                "code": "153",
                "title": "Glo D-MFIN-6-DATA857 for Social Plan 7 days",
                "price": "50",
                "validity": "Social Plan 7 days"
            },
            {
                "code": "154",
                "title": "Glo D-MFIN-6-DATA858 for Social Plan 30 days",
                "price": "100",
                "validity": "Social Plan 30 days"
            },
            {
                "code": "155",
                "title": "Glo D-MFIN-6-DATA859 for Social Plan 1 days",
                "price": "25",
                "validity": "Social Plan 1 days"
            },
            {
                "code": "156",
                "title": "Glo D-MFIN-6-DATA860 for Social Plan 7 days",
                "price": "50",
                "validity": "Social Plan 7 days"
            },
            {
                "code": "157",
                "title": "Glo D-MFIN-6-DATA861 for Social Plan 30 days",
                "price": "100",
                "validity": "Social Plan 30 days"
            },
            {
                "code": "158",
                "title": "Glo D-MFIN-6-DATA869 for Social Plan 7 days",
                "price": "50",
                "validity": "Social Plan 7 days"
            },
            {
                "code": "159",
                "title": "Glo D-MFIN-6-DATA871 for Social Plan 1 days",
                "price": "50",
                "validity": "Social Plan 1 days"
            },
            {
                "code": "160",
                "title": "Glo D-MFIN-6-DATA872 for Social Plan 7 days",
                "price": "100",
                "validity": "Social Plan 7 days"
            },
            {
                "code": "161",
                "title": "Glo D-MFIN-6-DATA873 for Social Plan 30 days",
                "price": "250",
                "validity": "Social Plan 30 days"
            },
            {
                "code": "162",
                "title": "Glo D-MFIN-6-DATA874 for Social Plan 1 days",
                "price": "50",
                "validity": "Social Plan 1 days"
            },
            {
                "code": "163",
                "title": "Glo D-MFIN-6-DATA875 for Social Plan 1 days",
                "price": "130",
                "validity": "Social Plan 1 days"
            },
            {
                "code": "164",
                "title": "Glo D-MFIN-6-DATA876 for Social Plan 1 days",
                "price": "50",
                "validity": "Social Plan 1 days"
            },
            {
                "code": "165",
                "title": "Glo D-MFIN-6-DATA877 for Social Plan 7 days",
                "price": "200",
                "validity": "Social Plan 7 days"
            }
        ],
        AIRTEL: [
            {
                "code": "55",
                "title": "Airtel D-MFIN-1-40MB for 1 day",
                "price": "50",
                "validity": "1 day"
            },
            {
                "code": "56",
                "title": "Airtel D-MFIN-1-100MB for 1 day",
                "price": "99",
                "validity": "1 day"
            },
            {
                "code": "57",
                "title": "Airtel D-MFIN-1-200MB for 3 days",
                "price": "199",
                "validity": "3 days"
            },
            {
                "code": "58",
                "title": "Airtel D-MFIN-1-350MB for 7 days",
                "price": "349",
                "validity": "7 days"
            },
            {
                "code": "59",
                "title": "Airtel D-MFIN-1-750MB for 7 days",
                "price": "499",
                "validity": "7 days"
            },
            {
                "code": "60",
                "title": "Airtel D-MFIN-1-1.5GB for 30 days",
                "price": "999",
                "validity": "30 days"
            },
            {
                "code": "61",
                "title": "Airtel D-MFIN-1-3GB for 30 days",
                "price": "1499",
                "validity": "30 days"
            },
            {
                "code": "62",
                "title": "Airtel D-MFIN-1-6GB for 30 days",
                "price": "2499",
                "validity": "30 days"
            },
            {
                "code": "63",
                "title": "Airtel D-MFIN-1-11GB for 30 days",
                "price": "3999",
                "validity": "30 days"
            },
            {
                "code": "64",
                "title": "Airtel D-MFIN-1-20GB for 30 days",
                "price": "4999",
                "validity": "30 days"
            },
            {
                "code": "65",
                "title": "Airtel D-MFIN-1-40GB for 30 days",
                "price": "9999",
                "validity": "30 days"
            },
            {
                "code": "66",
                "title": "Airtel D-MFIN-1-75GB for 30 days",
                "price": "14999",
                "validity": "30 days"
            },
            {
                "code": "67",
                "title": "Airtel D-MFIN-1-8GB for 30 days",
                "price": "2999",
                "validity": "30 days"
            },
            {
                "code": "68",
                "title": "Airtel D-MFIN-1-120GB for 30 days",
                "price": "19999",
                "validity": "30 days"
            },
            {
                "code": "69",
                "title": "Airtel D-MFIN-1-1GB1D for 1 day",
                "price": "349",
                "validity": "1 day"
            },
            {
                "code": "70",
                "title": "Airtel D-MFIN-1-2GB1D for 1 day",
                "price": "499",
                "validity": "1 day"
            },
            {
                "code": "71",
                "title": "Airtel D-MFIN-1-6GB1W for 7 days",
                "price": "1499",
                "validity": "7 days"
            },
            {
                "code": "72",
                "title": "Airtel D-MFIN-1-2GB1M for 30 days",
                "price": "1199",
                "validity": "30 days"
            },
            {
                "code": "73",
                "title": "Airtel D-MFIN-1-4.5GB for 30 days",
                "price": "1999",
                "validity": "30 days"
            },
            {
                "code": "74",
                "title": "Airtel D-MFIN-1-25GB1M for 30 days",
                "price": "7999",
                "validity": "30 days"
            },
            {
                "code": "75",
                "title": "Airtel D-MFIN-1-200GB1M for 30 days",
                "price": "29999",
                "validity": "30 days"
            },
            {
                "code": "76",
                "title": "Airtel D-MFIN-1-280GB1M for 30 days",
                "price": "35999",
                "validity": "30 days"
            },
            {
                "code": "77",
                "title": "Airtel D-MFIN-1-400GB3M for 90 days",
                "price": "49999",
                "validity": "90 days"
            },
            {
                "code": "78",
                "title": "Airtel D-MFIN-1-500GB4M for 120 days",
                "price": "59999",
                "validity": "120 days"
            },
            {
                "code": "79",
                "title": "Airtel D-MFIN-1-1TB1Y for 365 days",
                "price": "99999",
                "validity": "365 days"
            },
            {
                "code": "80",
                "title": "Airtel D-MFIN-1-1GB for 14 day",
                "price": "599",
                "validity": "14 day"
            },
            {
                "code": "81",
                "title": "Airtel D-MFIN-1-15GB for 7 day",
                "price": "999",
                "validity": "7 day"
            },
            {
                "code": "82",
                "title": "Airtel D-MFIN-1-7GB for 7 day",
                "price": "1999",
                "validity": "7 day"
            },
            {
                "code": "83",
                "title": "Airtel D-MFIN-1-25GB for 7 day",
                "price": "4999",
                "validity": "7 day"
            },
            {
                "code": "84",
                "title": "Airtel D-MFIN-1-15MB for 1 day",
                "price": "399",
                "validity": "1 day"
            },
            {
                "code": "85",
                "title": "Airtel D-MFIN-1-35GB for 2 day",
                "price": "799",
                "validity": "2 day"
            },
            {
                "code": "86",
                "title": "Airtel D-MFIN-1-23GB for 30 day",
                "price": "5999",
                "validity": "30 day"
            },
            {
                "code": "87",
                "title": "Airtel D-MFIN-1-50MB for This Data plan gives 40MB for N50 valid for 1day (Social Plan)",
                "price": "50",
                "validity": "This Data plan gives 40MB for N50 valid for 1day (Social Plan)"
            },
            {
                "code": "88",
                "title": "Airtel D-MFIN-1-200MB2 for This Data plan gives 200MB for N100 valid for 5day (Social Plan)",
                "price": "100",
                "validity": "This Data plan gives 200MB for N100 valid for 5day (Social Plan)"
            },
            {
                "code": "89",
                "title": "Airtel D-MFIN-1-400MB for This Data plan gives 400MB for N100 valid for 3day (TikTok)",
                "price": "100",
                "validity": "This Data plan gives 400MB for N100 valid for 3day (TikTok)"
            },
            {
                "code": "90",
                "title": "Airtel D-MFIN-1-1024MB for This Data plan gives 1,024MB for N200 valid for 14day (Tik Tok)",
                "price": "200",
                "validity": "This Data plan gives 1,024MB for N200 valid for 14day (Tik Tok)"
            },
            {
                "code": "91",
                "title": "Airtel D-MFIN-1-2048MB for This Data plan gives 2,048MB for N200 valid for 1 hr",
                "price": "200",
                "validity": "This Data plan gives 2,048MB for N200 valid for 1 hr"
            },
            {
                "code": "92",
                "title": "Airtel D-MFIN-1-700MB for This Data plan gives 700MB for N300 valid for 25days (Social Plan)",
                "price": "300",
                "validity": "This Data plan gives 700MB for N300 valid for 25days (Social Plan)"
            }
        ],
        '9MOBILE': [
            {
                "code": "93",
                "title": "Etisalat D-MFIN-2-1.5GB for 30 days \t\r\n4.2GB (2GB+2.2GB Night)",
                "price": "1000",
                "validity": "30 days \t\r\n4.2GB (2GB+2.2GB Night)"
            },
            {
                "code": "94",
                "title": "Etisalat D-MFIN-2-2GB for 30 days 6.5GB (2.5GB+4GB Night)",
                "price": "1200",
                "validity": "30 days 6.5GB (2.5GB+4GB Night)"
            },
            {
                "code": "95",
                "title": "Etisalat D-MFIN-2-4.5GB for 30 days 9.5GB (5.5GB+4GB Night)",
                "price": "2000",
                "validity": "30 days 9.5GB (5.5GB+4GB Night)"
            },
            {
                "code": "96",
                "title": "Etisalat D-MFIN-2-40GB for 30 days",
                "price": "10000",
                "validity": "30 days"
            },
            {
                "code": "97",
                "title": "Etisalat D-MFIN-2-165GB for 1 days",
                "price": "300",
                "validity": "1 days"
            },
            {
                "code": "98",
                "title": "Etisalat D-MFIN-2-365GB for 30 days",
                "price": "3000",
                "validity": "30 days"
            },
            {
                "code": "99",
                "title": "Etisalat D-MFIN-2-11GB for 30 days 18.5GB (15GB+3.5GB Night)",
                "price": "4000",
                "validity": "30 days 18.5GB (15GB+3.5GB Night)"
            },
            {
                "code": "100",
                "title": "Etisalat D-MFIN-2-25MB for 1 day",
                "price": "50",
                "validity": "1 day"
            },
            {
                "code": "101",
                "title": "Etisalat D-MFIN-2-100MB for 1 day",
                "price": "100",
                "validity": "1 day"
            },
            {
                "code": "102",
                "title": "Etisalat D-MFIN-2-650MB for 1 day",
                "price": "200",
                "validity": "1 day"
            },
            {
                "code": "103",
                "title": "Etisalat D-MFIN-2-15GB for 30 days",
                "price": "5000",
                "validity": "30 days"
            },
            {
                "code": "104",
                "title": "Etisalat D-MFIN-2-100GB for 1 days",
                "price": "150",
                "validity": "1 days"
            },
            {
                "code": "105",
                "title": "Etisalat D-MFIN-2-7GB1W for 7 days",
                "price": "1500",
                "validity": "7 days"
            },
            {
                "code": "106",
                "title": "Etisalat D-MFIN-2-5M for 30 days",
                "price": "500",
                "validity": "30 days"
            },
            {
                "code": "107",
                "title": "Etisalat D-MFIN-2-75M30 for 30 days",
                "price": "15000",
                "validity": "30 days"
            },
            {
                "code": "108",
                "title": "Etisalat D-MFIN-2-75M for 30 days",
                "price": "20000",
                "validity": "30 days"
            },
            {
                "code": "109",
                "title": "Etisalat D-MFIN-2-2.5GB for 30 days \t11GB (7GB+ 4GB Night)",
                "price": "2500",
                "validity": "30 days \t11GB (7GB+ 4GB Night)"
            },
            {
                "code": "110",
                "title": "Etisalat D-MFIN-2-35GB for 30 days",
                "price": "7000",
                "validity": "30 days"
            }
        ]
    },
    BUYPOWERNG: {
        
    }
} as const

export const HTTP_URL = {
    BUYPOWERNG: {
        AIRTIME: BUYPOWER_URL!,
        DATA: BUYPOWER_URL!,
        CABLE: BUYPOWER_URL!,
        ELECTRICITY: BUYPOWER_URL!,
    },
    IRECHARGE: {
        AIRTIME: "https://irecharge.com.ng/api/v2/bills",
        DATA: "https://irecharge.com.ng/api/v2/bills",
        CABLE: "https://irecharge.com.ng/api/v2/bills",
        ELECTRICITY: "https://irecharge.com.ng/api/v2/bills",
    },
    BAXI: {
        AIRTIME: BAXI_URL!,
        DATA: BAXI_URL!,
        CABLE: BAXI_URL!,
        ELECTRICITY: BAXI_URL!,
    },
}