// Import required modules and types
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { IBaxiGetProviderResponse, IBaxiPurchaseResponse, IBaxiValidateMeterResponse, IBuyPowerGetProvidersResponse, IBuyPowerValidateMeterResponse, IValidateMeter, IVendToken } from "../utils/Interface";
import querystring from "querystring";
import { BAXI_TOKEN, BAXI_URL, BUYPOWER_TOKEN, BUYPOWER_URL, NODE_ENV } from "../utils/Constants";
import logger from "../utils/Logger";
const newrelic = require('newrelic');

interface _RequeryBuypowerSuccessResponse {
    result: {
        status: true,
        data: {
            id: number,
            amountGenerated: number,
            disco: string,
            orderId: string,
            receiptNo: string,
            tax: `${number}`,
            vendTime: Date,
            token: `${number}-${number}-${number}-${number}-${number}`,
            units: `${number}`,
            vendRef: string,
            responseCode: number,
            responseMessage: string
        }
    }
}

interface SuccessResponseForBuyPowerRequery {
    status: true,
    message: string,
    data: _RequeryBuypowerSuccessResponse['result']['data']
    responseCode: 200,
}

interface InprogressResponseForBuyPowerRequery {
    status: false,
    message: string,
    responseCode: 201
}

interface FailedResponseForBuyPowerRequery {
    status: false,
    message: string,
    responseCode: 202
}

type BuypowerRequeryResponse = _RequeryBuypowerSuccessResponse | InprogressResponseForBuyPowerRequery | FailedResponseForBuyPowerRequery

// Define the VendorService class for handling provider-related operations
export default class VendorService {

    // Static method for obtaining a Baxi vending token
    static async baxiVendToken(body: IVendToken) {
        const {
            transactionId,
            meterNumber,
            disco,
            amount,
            phone
        } = body

        try {
            const response = await this.baxiAxios().post<IBaxiPurchaseResponse>('/request', {
                amount,
                phone,
                account_number: meterNumber,
                service_type: disco.toLowerCase() + '_electric' + '_prepaid',
                agentId: 'baxi',
                agentReference: transactionId
            })

            return response.data.data
        } catch (error: any) {
            logger.error(error)
            throw new Error(error.message)
        }
    }

    // Static method for validating a meter with Baxi
    static async baxiValidateMeter(disco: string, meterNumber: string, vendType: 'PREPAID' | 'POSTPAID') {
        const serviceType = disco.toLowerCase() + '_electric' + `_${vendType.toLowerCase()}`  // e.g. aedc_electric_prepaid
        const postData = {
            service_type: serviceType,
            account_number: NODE_ENV === 'development' ? '6528651914' : meterNumber // Baxi has a test meter number
        }

        try {
            const response = await this.baxiAxios().post<IBaxiValidateMeterResponse>('/verify', postData)
            return response.data.data
        } catch (error: any) {
            logger.error(error)
            throw new Error(error.message)
        }
    }

    static async baxiFetchAvailableDiscos() {
        try {
            const response = await this.baxiAxios().get<IBaxiGetProviderResponse>('/billers')
            const responseData = response.data

            const providers = [] as { name: string, serviceType: 'PREPAID' | 'POSTPAID' }[]

            for (const provider of responseData.data.providers) {
                const serviceProvider = provider.service_type.split('_')[0].toUpperCase()
                const serviceType = provider.service_type.split('_')[2].toUpperCase()

                if (provider.service_type.includes('electric')) {
                    providers.push({
                        name: serviceProvider + ` ${serviceType}`,
                        serviceType: serviceType as 'PREPAID' | 'POSTPAID',
                    })
                }
            }

            return providers
        } catch (error) {
            logger.error(error)
            throw new Error()
        }
    }

    // Static method for checking Disco updates with Baxi
    static async baxiCheckDiscoUp(disco: string) {
        try {
            const responseData = await this.baxiFetchAvailableDiscos()

            for (const provider of responseData) {
                const name = provider.name.split(' ')[0]
                if (name.toUpperCase() === disco.toUpperCase()) {
                    return true
                }
            }

            return false
        } catch (error) {
            logger.error(error)
            throw new Error()
        }
    }

    static baxiAxios(): AxiosInstance {
        const AxiosCreate = axios.create({
            baseURL: `${BAXI_URL}`,
            headers: {
                'x-api-key': BAXI_TOKEN
            }
        });

        return AxiosCreate;
    }

    // Static method for creating a BuyPower Axios instance
    static buyPowerAxios(): AxiosInstance {
        // Create an Axios instance with BuyPower URL and token in the headers
        const AxiosCreate = axios.create({
            baseURL: `${BUYPOWER_URL}`,
            headers: {
                Authorization: `Bearer ${BUYPOWER_TOKEN}`
            }
        });

        return AxiosCreate;
    }

    // Static method for vending a token with BuyPower
    static async buyPowerVendToken(body: IVendToken) {
        // Define data to be sent in the POST request
        const postData = {
            orderId: body.transactionId,
            meter: body.meterNumber,
            disco: body.disco,
            paymentType: "B2B",
            vendType: body.vendType.toUpperCase(),
            amount: body.amount,
            phone: body.phone
        }

        if (NODE_ENV === 'development') {
            postData.phone = '08034210294'
            postData.meter = '12345678910'
        }

        try {
            // Make a POST request using the BuyPower Axios instance
            const response = await this.buyPowerAxios().post(`/vend?strict=0`, postData);
            return response.data;
        } catch (error: any) {
            if (error instanceof AxiosError) {
                if (error.response?.data?.message === "An unexpected error occurred. Please requery.") {
                    logger.error(error.message, { meta: { stack: error.stack, responseData: error.response.data } })
                    throw new Error('Transaction timeout')
                }
            }

            throw error
        }

        // TODO: Use event emitter to requery transaction after 10s
    }

    static async buyPowerRequeryTransaction({ transactionId }: { transactionId: string }) {
        try {
            const response = await this.buyPowerAxios().get<BuypowerRequeryResponse>(`/transaction/${transactionId}`)

            const successResponse = response.data as _RequeryBuypowerSuccessResponse
            if (successResponse.result.status === true) {
                return {
                    status: true,
                    message: 'Transaction successful',
                    data: successResponse.result.data,
                    responseCode: 200
                } as SuccessResponseForBuyPowerRequery
            }

            return response.data as InprogressResponseForBuyPowerRequery | FailedResponseForBuyPowerRequery
        } catch (error) {
            throw error
        }
    }

    // Static method for validating a meter with BuyPower
    static async buyPowerValidateMeter(body: IValidateMeter) {
        // Define query parameters using the querystring module
        const paramsObject: any = {
            meter: NODE_ENV === 'development' ? '12345678910' : body.meterNumber,
            disco: body.disco,
            vendType: body.vendType.toUpperCase(),
            vertical: 'ELECTRICITY'
        }
        const params: string = querystring.stringify(paramsObject);

        try {
            // Make a GET request using the BuyPower Axios instance
            const response = await this.buyPowerAxios().get<IBuyPowerValidateMeterResponse>(`/check/meter?${params}`);
            return response.data;
        } catch (error: any) {
            throw new Error('An error occurred while validating meter');
        }
    }

    // Static method for checking Disco updates with BuyPower
    static async buyPowerCheckDiscoUp(disco: string): Promise<boolean> {
        try {
            // Make a GET request to check Disco updates
            const response = await this.buyPowerAxios().get(`${BUYPOWER_URL}/discos/status`);
            const data = response.data;
            if (data[disco.toUpperCase()] === true) return true;
            else return false;
        } catch (error) {
            logger.info(error)
            throw new Error()
        }
    }

    static async buyPowerFetchAvailableDiscos() {
        try {
            const providers = [] as { name: string, serviceType: 'PREPAID' | 'POSTPAID' }[]

            const response = await this.buyPowerAxios().get<IBuyPowerGetProvidersResponse>('/discos/status')
            const responseData = response.data

            for (const key of Object.keys(responseData)) {
                if (responseData[key as keyof IBuyPowerGetProvidersResponse] === true) {
                    providers.push({
                        name: key.toUpperCase() + ' PREPAID',
                        serviceType: 'PREPAID',
                    })

                    providers.push({
                        name: key.toUpperCase() + ' POSTPAID',
                        serviceType: 'POSTPAID',
                    })
                }
            }

            return providers
        } catch (error) {
            logger.error(error)
            throw new Error()
        }
    }
}
