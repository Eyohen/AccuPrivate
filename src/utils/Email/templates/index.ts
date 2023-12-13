import ejs from 'ejs';
import fs from 'fs';
import { LOGO_URL } from '../../Constants';
import { IReceiptEmailTemplateProps } from '../../Interface';
import Transaction from '../../../models/Transaction.model';

const containerTemplate = fs.readFileSync(__dirname + '/container.ejs', 'utf8')

const container = (contentTemplate: string) => ejs.render(containerTemplate, { contentTemplate, LOGO_URL })

interface EmailVerificationProps {
    partnerEmail: string;
    otpCode: string;
}

class EmailTemplate {
    failedTransaction = async({ transaction }: { transaction: Transaction }) => {
        return container(await ejs.renderFile(__dirname + '/failedtxn.ejs', { transaction}))
    }
    receipt = async ({ transaction, meterNumber, token }: IReceiptEmailTemplateProps) => {
        return container(await ejs.renderFile(__dirname + '/receipt.ejs', { transaction, meterNumber, token }))
    }
    emailVerification = async ({ partnerEmail, otpCode }: EmailVerificationProps) => {
        return container(await ejs.renderFile(__dirname + '/emailverification.ejs', { partnerEmail, otpCode }))
    }
    awaitActivation = async (partnerEmail: string) => {
        return container(await ejs.renderFile(__dirname + '/awaitactivation.ejs', { partnerEmail }))
    }
    forgotPassword = async ({ email, otpCode }: { email: string, otpCode: string }) => {
        return container(await ejs.renderFile(__dirname + '/forgotpassword.ejs', { email, otpCode }))
    }
    accountActivation = async (email: string) => {
        return container(await ejs.renderFile(__dirname + '/accountactivation.ejs', { email }))
    }
    inviteTeamMember = async (email: string) => {
        return container(await ejs.renderFile(__dirname + '/teaminvitation.ejs', { email }))
    }
}

export default EmailTemplate
