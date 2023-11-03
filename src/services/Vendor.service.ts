// Import required modules and types
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { IBaxiGetProviderResponse, IBaxiPurchaseResponse, IValidateMeter, IVendToken } from "../utils/Interface";
import querystring from "querystring";
import { BAXI_TOKEN, BAXI_URL, BUYPOWER_TOKEN, BUYPOWER_URL } from "../utils/Constants";


// Define the VendorService class for handling vendor-related operations
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
            console.error(error)
            throw new Error(error.message)
        }
    }

    // Static method for validating a meter with Baxi
    static async baxiValidateMeter(disco: string, meterNumber: string) {
        const serviceType = disco.toLowerCase() + '_electric' + '_prepaid'  // e.g. aedc_electric_prepaid
        const postData = {
            service_type: serviceType,
            account_number: meterNumber
        }

        try {
            const response = await this.baxiAxios().post<IBaxiPurchaseResponse>('/verify', postData)
            return response.data
        } catch (error: any) {
            throw new Error(error.message)
        }
    }

    // Static method for checking Disco updates with Baxi
    static async baxiCheckDiscoUp(disco: string) {
        try {
            const response = await this.baxiAxios().get<IBaxiGetProviderResponse>('/billers')
            const responseData = response.data

            for (const provider of responseData.data.providers) {
                if (provider.shortname === disco) {
                    return true
                }
            }
        } catch (error) {
            console.error(error)
            throw new Error()
        }
    }

    static baxiAxios(): AxiosInstance {
        const AxiosCreate = axios.create({
            baseURL: `${BAXI_URL}`,
            headers: {
                Authorization: `Bearer ${BAXI_TOKEN}`
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
            vendType: "PREPAID",
            amount: body.amount,
            phone: body.phone
        }

        let initialError: any

        try {
            // Make a POST request using the BuyPower Axios instance
            const response = await this.buyPowerAxios().post(`/vend?strict=0`, postData);
            return response.data;
        } catch (error: any) {
            initialError = error
            console.log(error.response.data.message)
        }

        if (initialError.response.data.message === "An unexpected error occurred. Please requery.") {
            try {
                const response = await this.buyPowerAxios().get(`/transaction/${body.transactionId}`)
                return response.data
            } catch (error) {
                throw error
            }
        }

    }


    // Static method for validating a meter with BuyPower
    static async buyPowerValidateMeter(body: IValidateMeter) {
        // Define query parameters using the querystring module
        const paramsObject: any = {
            meter: body.meterNumber,
            disco: body.disco,
            vendType: 'PREPAID',
            vertical: 'ELECTRICITY'
        }
        const params: string = querystring.stringify(paramsObject);

        try {
            // Make a GET request using the BuyPower Axios instance
            const response = await this.buyPowerAxios().get(`/check/meter?${params}`);
            return response.data;
        } catch (error: any) {
            throw new Error()
        }
    }

    // Static method for checking Disco updates with BuyPower
    static async buyPowerCheckDiscoUp(disco: string): Promise<boolean | Error> {
        try {
            // Make a GET request to check Disco updates
            const response = await this.buyPowerAxios().get(`${BUYPOWER_URL}/discos/status`);
            const data = response.data;
            if (data[disco] === true) return true;
            else return false;
        } catch (error) {
            console.log(error)
            throw new Error()
        }
    }
}
