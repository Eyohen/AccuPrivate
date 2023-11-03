export interface IVendToken {
    transactionId: string 
    meterNumber: string 
    disco: string 
    amount: string 
    phone: string 
}


export interface IValidateMeter {
    transactionId: string 
    meterNumber: string 
    disco: string 
}


export interface IBaxiGetProviderResponse {
    "status": "success",
    "message": "Successful",
    "code": 200,
    "data": {
        "providers": {
            "service_type": string,
            "shortname": string,
            "biller_id": number,
            "product_id": number,
            "name": string
        }[]
    }
}

export interface IBaxiPurchaseResponse {
    status: string;
    statusCode: string;
    message: string;
    data: {
        transactionStatus: string;
        transactionReference: number;
        statusCode: string;
        transactionMessage: string;
        tokenCode: string;
        tokenAmount: null | number;
        amountOfPower: null | number;
        rawOutput?: {
            fees: {
                amount: number;
                kind: string | null;
                description: string | null;
                taxAmount: number;
            }[];
            feeder: string;
            dssName: string;
            serviceBand: string;
            message: string | null;
            token: string;
            rate: string | null;
            exchangeReference: string;
            tariff: string | null;
            power: string | null;
            resetToken: string;
            status: string;
            statusCode: string;
        };
        provider_message: string;
        baxiReference: number;
    }
}