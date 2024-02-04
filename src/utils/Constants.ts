import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

const deployed = process.env.DEPLOYED;
const path = deployed ? `/etc/secrets/.env` : `${__dirname}/../.env`;
dotenv.config({ path });

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
export const EMAIL_HOST = process.env.EMAIL_HOST as string
export const EMAIL_PORT = process.env.EMAIL_PORT as string
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
    IRECHARGE_VENDOR_CODE = process.env.IRECHARGE_VENDOR_CODE as string;

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
            IRECHARGE: { discoCode: 'Jos_Disco', commission: 1.50 }
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
                IRECHARGE: { discoCode: 'AEDC', commission: 1.80, bonus: 0 },
            }
        },
        'ECEKEPS': {
            productName: 'EKO',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'eko_electric_postpaid', commission: 1, bonus: 0 },
                BUYPOWERNG: { discoCode: 'EKO', commission: 1.40, bonus: 0 },
                IRECHARGE: { discoCode: 'Eko_Postpaid', commission: 1.50, bonus: 60 },
            }
        },
        'ECIKEPS': {
            productName: 'IKEJA',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'ikeja_electric_postpaid', commission: 1, bonus: 0 },
                BUYPOWERNG: { discoCode: 'IKEJA', commission: 1.40, bonus: 0 },
                IRECHARGE: { discoCode: 'Ikeja_Electric_Bill_Payment', commission: 1, bonus: 60 },
            }
        },
        'ECJOPPS': {
            productName: 'JOS',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'jos_electric_postpaid', commission: 1, bonus: 0 },
                BUYPOWERNG: { discoCode: 'JOS', commission: 1.80, bonus: 0 },
                IRECHARGE: { discoCode: 'Jos_Disco_Postpaid', commission: 1.50, bonus: 0 },
            }
        },
        'ECJOPPE': {
            productName: 'JOS',
            type: 'PREPAID',
            vendors: {
                BAXI: { discoCode: 'jos_electric_prepaid', commission: 1, bonus: 0 },
                BUYPOWERNG: { discoCode: 'JOS', commission: 1.80, bonus: 0 },
                IRECHARGE: { discoCode: 'Jos_Disco_Prepaid', commission: 1.50, bonus: 60 },
            }
        },
        'ECKDEPE': {
            productName: 'KADUNA',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'kaduna_electric_prepaid', commission: 1.20, bonus: 0 },
                BUYPOWERNG: { discoCode: 'KADUNA', commission: 2.30, bonus: 0 },
                IRECHARGE: { discoCode: 'Kaduna_Electricity_Disco_Prepaid', commission: 2.00, bonus: 70 },
            }
        },
        'ECEKEPE': {
            productName: 'EKO',
            type: 'PREPAID',
            vendors: {
                BAXI: { discoCode: 'eko_electric_prepaid', commission: 1, bonus: 0 },
                BUYPOWERNG: { discoCode: 'EKO', commission: 1.40, bonus: 0 },
                IRECHARGE: { discoCode: 'Eko_Prepaid', commission: 1.0, bonus: 70 },
            }
        },
        'ECKDEPS': {
            productName: 'KADUNA',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'kaduna_electric_postpaid', commission: 1.20, bonus: 0 },
                BUYPOWERNG: { discoCode: 'KADUNA', commission: 2.30, bonus: 0 },
                IRECHARGE: { discoCode: 'Kaduna_Electricity_Disco_Postpaid', commission: 2.00, bonus: 0 },
            }
        },
        'ECJSEPE': {
            productName: 'JOS',
            type: 'PREPAID',
            vendors: {
                BAXI: { discoCode: 'jos_electric_prepaid', commission: 1, bonus: 0 },
                BUYPOWERNG: { discoCode: 'JOS', commission: 1.80, bonus: 0 },
                IRECHARGE: { discoCode: 'Jos_Disco', commission: 1.50, bonus: 60 },
            }
        },
        'ECJSEPS': {
            productName: 'JOS',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'jos_electric_postpaid', commission: 1, bonus: 0 },
                BUYPOWERNG: { discoCode: 'JOS', commission: 1.80, bonus: 0 },
                IRECHARGE: { discoCode: 'Jos_Disco_Postpaid', commission: 1.50, bonus: 0 },
            }
        },
        'ECPHEPE': {
            productName: 'PORT-HARCOURT',
            type: 'PREPAID',
            vendors: {
                BAXI: { discoCode: 'portharcourt_electric_prepaid', commission: 1.20, bonus: 0 },
                BUYPOWERNG: { discoCode: 'PH', commission: 1.80, bonus: 0 },
                IRECHARGE: { discoCode: 'PH_Disco', commission: 1.50, bonus: 50 },
            }
        },
        'ECPHEPS': {
            productName: 'PORT-HARCOURT',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'portharcourt_electric_postpaid', commission: 1.20, bonus: 0 },
                BUYPOWERNG: { discoCode: 'PH', commission: 1.80, bonus: 0 },
                IRECHARGE: { discoCode: 'PH_Disco', commission: 1.50, bonus: 50 },
            }
        },
        'ECBNEPS': {
            productName: 'BENIN',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'ECBNEPS', commission: 2.20, bonus: 0 },
                BUYPOWERNG: { discoCode: 'BENIN', commission: 2.20, bonus: 0 },
                IRECHARGE: { discoCode: 'Benin', commission: 2.20, bonus: 0 },
            }
        },
        'ECBNEPE': {
            productName: 'BENIN',
            type: 'PREPAID',
            vendors: {
                BAXI: { discoCode: 'ECBNEPE', commission: 2.20, bonus: 0 },
                BUYPOWERNG: { discoCode: 'BENIN', commission: 2.20, bonus: 0 },
                IRECHARGE: { discoCode: 'Benin', commission: 2.20, bonus: 0 },
            }
        },
        'ECAHBEPS': {
            productName: 'YOLA',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'YOLA', commission: 1.80, bonus: 0 },
                BUYPOWERNG: { discoCode: 'YOLA', commission: 1.80, bonus: 0 },
                IRECHARGE: { discoCode: 'YOLA', commission: 1.20, bonus: 0 },
            }
        },
    },
    AIRTIME: {
        'TCMTNVT': {
            productName: 'MTN',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'eko_electric_postpaid', commission: 2, bonus: 0 },
                BUYPOWERNG: { discoCode: 'EKO', commission: 0, bonus: 0 },
                IRECHARGE: { discoCode: 'Eko_Postpaid', commission: 2.50, bonus: 0 },
            }
        },
        'TCGLOVT': {
            productName: 'GLO',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'glo', commission: 3.50, bonus: 0 },
                BUYPOWERNG: { discoCode: 'GLO', commission: 0, bonus: 0 },
                IRECHARGE: { discoCode: 'Glo', commission: 4.0, bonus: 0 },
            }
        },
        'TC9MBVT': {
            productName: '9MOBILE',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: '9mobile', commission: 3.5, bonus: 0 },
                BUYPOWERNG: { discoCode: '9MOBILE', commission: 0, bonus: 0 },
                IRECHARGE: { discoCode: '9MOBILE', commission: 3.5, bonus: 0 },
            }
        },
        'TCATLVT': {
            productName: 'AIRTEL',
            type: 'POSTPAID',
            vendors: {
                BAXI: { discoCode: 'airtel', commission: 2, bonus: 0 },
                BUYPOWERNG: { discoCode: 'AIRTEL', commission: 0, bonus: 0 },
                IRECHARGE: { discoCode: 'Airtel', commission: 3, bonus: 0 },
            }
        },
    },
} as const;

console.log(SEED);


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