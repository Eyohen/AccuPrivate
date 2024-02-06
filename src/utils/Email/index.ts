import EmailTemplate from "./templates";
import logger from "../Logger";
import {
    EMAIL_HOST_ADDRESS, SENDGRID_API_KEY,
} from "../Constants";
import sendgridClient from '@sendgrid/mail'
require('newrelic')

interface IPartialMailOptions {
    from?: string;
    to: string;
    subject: string;
}
type TMailOptions = IPartialMailOptions & ({ text: string } | { html: string });

export default class EmailService {
    static async sendEmail(mailOptions: TMailOptions): Promise<void | Error> {
        try {
            sendgridClient.setApiKey('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')
            mailOptions.from = mailOptions.from ?? EMAIL_HOST_ADDRESS;
            
            await sendgridClient.send({
                ...mailOptions,
                from: EMAIL_HOST_ADDRESS,
                to: mailOptions.to,
                subject: mailOptions.subject,
            })
            
            mailOptions.from = mailOptions.from ?? EMAIL_HOST_ADDRESS;
        } catch (error: any) {
            console.log(error.response.body.errors)
            logger.error(error.stack);
        }
    }
}

export { EmailTemplate };
