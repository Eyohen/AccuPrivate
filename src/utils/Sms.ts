import AfricasTalking from 'africastalking'
import { AFRICASTALKING_API_KEY, AFRICASTALKING_USERNAME, NODE_ENV } from './Constants';
import axios from 'axios'

const client = axios.create({
    baseURL: NODE_ENV == "development" ? "https://api.sandbox.africastalking.com/version1/messaging" : "https://api.sandbox.africastalking.com/version1/messaging",
    headers: {
        apiKey: AFRICASTALKING_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
    }
})


export class SmsService {
    static sendSms = async (to: string, message: string) => {
        try {
            const result = await client.post("", {
                username: AFRICASTALKING_USERNAME,
                to: to,
                message: message
            })
            console.log(result)
            return result;
        } catch (ex) {
            throw ex;
        }
    }
}