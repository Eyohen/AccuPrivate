import nodemailer from "nodemailer";
import EmailTemplate from "./templates";
import logger from "../../utils/Logger";
import {
    EMAIL_HOST,
    EMAIL_HOST_ADDRESS,
    EMAIL_PORT,
    OAUTH_ACCESS_TOKEN,
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
    OAUTH_REFRESH_TOKEN,
} from "../../utils/Constants";

interface IPartialMailOptions {
    from?: string;
    to: string;
    subject: string;
}
type TMailOptions = IPartialMailOptions & ({ text: string } | { html: string });

export default class EmailService {
    static async sendEmail(mailOptions: TMailOptions): Promise<void | Error> {
        try {
            const transporter = nodemailer.createTransport({
                host: EMAIL_HOST,
                port: EMAIL_PORT,
                secure: true,
                auth: {
                    type: "OAuth2",
                    user: EMAIL_HOST_ADDRESS,
                    clientId: OAUTH_CLIENT_ID,
                    clientSecret: OAUTH_CLIENT_SECRET,
                    refreshToken: OAUTH_REFRESH_TOKEN,
                    accessToken: OAUTH_ACCESS_TOKEN,
                },
            } as nodemailer.TransportOptions);

            mailOptions.from = mailOptions.from ?? EMAIL_HOST_ADDRESS;

            await transporter.sendMail(mailOptions);
        } catch (error: any) {
            logger.error(error);
        }
    }
}

export { EmailTemplate };
