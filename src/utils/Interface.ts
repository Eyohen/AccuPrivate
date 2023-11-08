export interface IVendToken {
    transactionId: string
    meterNumber: string
    disco: string
    amount: string
    phone: string
    vendType: 'PREPAID' | 'POSTPAID'
}


export interface IValidateMeter {
    transactionId: string
    meterNumber: string
    disco: string
    vendType: 'PREPAID' | 'POSTPAID'
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

export interface IBaxiValidateMeterResponse {
    status: 'success',
    message: 'Successful',
    code: 200,
    data: {
        name: string,
        address: string,
        outstandingBalance: number,
        dueDate: string,
        district: string,
        accountNumber: string,
        minimumAmount: number,
        rawOutput: null,
        errorMessage: null
    }
}

export interface IBuyPowerValidateMeterResponse {
    error: false,
    discoCode: string,
    vendType: 'PREPAID' | 'POSTPAID',
    meterNo: `${number}`,
    minVendAmount: number,
    maxVendAmount: number,
    responseCode: number,
    outstanding: number,
    debtRepayment: number,
    name: string,
    address: string,
    orderId: string
}

export interface IBuyPowerGetProvidersResponse {
    "ABUJA": true,
    "EKO": true,
    "IKEJA": true,
    "IBADAN": true,
    "ENUGU": true,
    "PH": true,
    "JOS": true,
    "KADUNA": true,
    "KANO": true,
    "BH": true,
    "PROTOGY": false,
    "PHISBOND": false, 
    "ACCESSPOWER": false,
    "APLE": false,
    "BENIN": false,
    "YOLA": true
}