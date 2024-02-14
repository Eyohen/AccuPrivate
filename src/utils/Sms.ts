import AfricasTalking from 'africastalking'
import { AFRICASTALKING_API_KEY, AFRICASTALKING_SENDER, AFRICASTALKING_USERNAME, NODE_ENV } from './Constants';


const africastalking = AfricasTalking({
    apiKey: '555607f1e498a5288cfce3787774080df0675a1d32ed7e4edbaf2d1fc9584394',
    username: 'sandbox'
});

export class SmsService {
    static sendSms = async (to: string, message: string) => {
        try {
            const result = await africastalking.SMS.send({
                to,
                message,
                from: '8845'
            });
            return result;
        } catch (ex) {
            throw ex;
        }
    }
}
