import axios, { AxiosInstance } from 'axios';
import { BAXI_AGENT_ID, BAXI_TOKEN } from '../../../utils/Constants';


class BaxiApiBaseConfig {
    protected static baxiApi = axios.create({
        baseURL: 'https://payments.baxipay.com.ng/api/baxipay/services',
        headers: {
            'x-api-key': BAXI_TOKEN,
        },
    });
    protected static agentId = BAXI_AGENT_ID;
}

export interface BaxiSuccessfulPuchaseResponse {
    status: string;
    message: string;
    code: number;
    data: {
        statusCode: string;
        transactionStatus: string;
        transactionReference: number;
        transactionMessage: string;
        baxiReference: number;
        provider_message: string;
        extraData: {
            balance: string;
            exchangeReference: string;
            responseMessage: string;
            status: string;
            statusCode: string;
            responseCode: string;
        };
    };
};


export default BaxiApiBaseConfig;
