import { NextFunction, Request, Response } from "express";
import TransactionService from "../../services/Transaction.service";
import Transaction, { PaymentType, Status } from "../../models/Transaction.model";
import { v4 as uuidv4 } from 'uuid';
import UserService from "../../services/User.service";
import MeterService from "../../services/Meter.service";
import User from "../../models/User.model";
import Meter from "../../models/Meter.model";
import VendorService from "../../services/Vendor.service";
import PowerUnit from "../../models/PowerUnit.model";
import PowerUnitService from "../../services/PowerUnit.service";
import { DEFAULT_ELECTRICITY_PROVIDER, DISCO_LOGO, NODE_ENV } from "../../utils/Constants";
import { BadRequestError, GateWayTimeoutError, InternalServerError, NotFoundError } from "../../utils/Errors";
import { generateRandomToken } from "../../utils/Helper";
import EmailService, { EmailTemplate } from "../../utils/Email";
import ResponseTrimmer from '../../utils/ResponseTrimmer'
import NotificationUtil from "../../utils/Notification";
import Entity from "../../models/Entity/Entity.model";
import NotificationService from "../../services/Notification.service";
import EventService from "../../services/Event.service";
import { AuthenticatedRequest } from "../../utils/Interface";
import { DataType, DataTypes, JSONB } from "sequelize";
import Event from "../../models/Event.model";

interface valideMeterRequestBody {
    meterNumber: string
    superagent: 'BUYPOWERNG' | 'BAXI',
    vendType: 'PREPAID' | 'POSTPAID',
    disco: string
    phoneNumber: string
    partnerName: string
    email: string
}

interface vendTokenRequestBody {
    meterNumber: string
    provider: 'BUYPOWERNG' | 'BAXI'
    disco: string
    phoneNumber: string
    partnerName: string
    email: string
}

interface RequestTokenValidatorParams {
    bankRefId: string
    transactionId: string
}

interface RequestTokenValidatorResponse {
    user: User
    meter: Meter
    transaction: Transaction
    partnerEntity: Entity
}

// Validate request parameters for each controller
class VendorControllerValdator {
    static validateMeter() {

    }

    static async requestToken({ bankRefId, transactionId }: RequestTokenValidatorParams): Promise<RequestTokenValidatorResponse> {
        if (!bankRefId) throw new BadRequestError('Transaction reference is required')

        const transactionRecord: Transaction | null = await TransactionService.viewSingleTransaction(transactionId)
        if (!transactionRecord) {
            throw new BadRequestError('Transaction does not exist')
        }

        // Check if Disco is Up
        const checKDisco: boolean | Error = await VendorService.buyPowerCheckDiscoUp(transactionRecord.disco)
        if (!checKDisco) throw new BadRequestError('Disco is currently down')

        // Check if bankRefId has been used before
        const existingTransaction: Transaction | null = await TransactionService.viewSingleTransactionByBankRefID(bankRefId)
        if (existingTransaction instanceof Transaction) {
            throw new BadRequestError('Bank reference has been used before')
        }

        const transactionHasCompleted = transactionRecord.status === Status.COMPLETE
        if (transactionHasCompleted) {
            throw new BadRequestError('Transaction has been completed before')
        }

        //  Get Meter 
        const meter: Meter | null = await transactionRecord.$get('meter')
        if (!meter) {
            throw new InternalServerError(`Transaction ${transactionRecord.id} does not have a meter`)
        }

        const user = await transactionRecord.$get('user')
        if (!user) {
            throw new InternalServerError(`Transaction ${transactionRecord.id} does not have a user`)
        }

        const partner = await transactionRecord.$get('partner')
        const entity = await partner?.$get('entity')
        if (!entity) {
            throw new InternalServerError('Entity not found')
        }

        return {
            user,
            meter,
            transaction: transactionRecord,
            partnerEntity: entity,
        }
    }

    static getDiscos() { }

    static checkDisco() { }
}


export default class VendorController {

    static async validateMeter(req: Request, res: Response, next: NextFunction) {
        const {
            meterNumber,
            disco,
            phoneNumber,
            email,
            vendType
        }: valideMeterRequestBody = req.body
        const superagent = DEFAULT_ELECTRICITY_PROVIDER // BUYPOWERNG or BAXI
        const transactionId = uuidv4()
        const partnerId = (req as any).key

        // We Check for Meter User *
        const response = superagent != 'BUYPOWERNG'
            ? await VendorService.buyPowerValidateMeter({
                transactionId,
                meterNumber,
                disco,
                vendType
            }).catch(e => { throw new BadRequestError('Meter validation failed') })
            : await VendorService.baxiValidateMeter(disco, meterNumber, vendType)
                .catch(e => { throw new BadRequestError('Meter validation failed') })

        // Add User
        const user: User = await UserService.addUser({
            id: uuidv4(),
            address: response.address,
            email: email,
            name: response.name,
            phoneNumber: phoneNumber,
        })

        const transaction: Transaction = await TransactionService.addTransaction({
            id: transactionId,
            amount: '0',
            status: Status.PENDING,
            superagent: superagent,
            paymentType: PaymentType.PAYMENT,
            transactionTimestamp: new Date(),
            disco: disco,
            userId: user.id,
            partnerId: partnerId,
        })

        await EventService.addEvent({
            id: uuidv4(),
            eventTimestamp: new Date(),
            status: Status.COMPLETE,
            eventType: 'VALIDATE_METER',
            eventText: 'Validate meter',
            source: 'API',
            eventData: JSON.stringify({}),
            transactionId: transactionId,
        })


        // Check if disco is up, and add event for it
        const discoUp = superagent === 'BUYPOWERNG'
            ? await VendorService.buyPowerCheckDiscoUp(disco).catch(e => e)
            : await VendorService.baxiCheckDiscoUp(disco).catch(e => e)

        discoUp instanceof Error
            ? await EventService.addEvent({
                id: uuidv4(),
                eventTimestamp: new Date(),
                status: Status.FAILED,
                eventType: 'DISCO_UP',
                eventText: 'Disco up',
                source: 'API',
                eventData: JSON.stringify({ disco }),
                transactionId: transactionId,
            })
            : await EventService.addEvent({
                id: uuidv4(),
                eventTimestamp: new Date(),
                status: Status.COMPLETE,
                eventType: 'DISCO_UP',
                eventText: 'Disco up',
                source: 'API',
                eventData: JSON.stringify({ disco }),
                transactionId: transactionId,
            })

        const meter: Meter = await MeterService.addMeter({
            id: uuidv4(),
            address: response.address,
            meterNumber: meterNumber,
            userId: user.id,
            disco: disco,
            vendType,
        })

        await transaction.update({ meterId: meter.id })

        const successful = transaction instanceof Transaction && user instanceof User && meter instanceof Meter
        if (!successful) throw new InternalServerError('An error occured while validating meter')

        res.status(200).json({
            status: 'success',
            data: {
                transaction: {
                    transactionId: transaction.id,
                    status: transaction.status,
                },
                meter: {
                    disco: meter.disco,
                    number: meter.meterNumber,
                    address: meter.address,
                    phone: user.phoneNumber,
                    vendType: meter.vendType,
                    name: user.name,
                }
            }
        })
    }

    static async requestToken(req: Request, res: Response, next: NextFunction) {
        const {
            transactionId,
            bankRefId,
            bankComment,
            amount,
            vendType
        } = req.query as Record<string, any>

        const { user, partnerEntity, transaction, meter } = await VendorControllerValdator.requestToken({ bankRefId, transactionId })

        // Initiate Purchase for token
        const tokenInfo = await VendorService.buyPowerVendToken({
            transactionId,
            meterNumber: meter.meterNumber,
            disco: transaction.disco,
            amount: amount,
            phone: user.phoneNumber,
            vendType: vendType as 'PREPAID' | 'POSTPAID'
        }).catch(error => error)
        if (tokenInfo instanceof Error) {
            if (tokenInfo.message !== 'Transaction timeout') throw tokenInfo

            await EventService.addEvent({
                id: uuidv4(),
                eventTimestamp: new Date(),
                status: Status.FAILED,
                eventType: 'REQUEST_TOKEN',
                eventText: 'Request token',
                source: 'API',
                eventData: JSON.stringify({
                    reason: 'TRANSACTION_TIMEOUT'
                }),
                transactionId: transactionId,
            })
            await TransactionService.updateSingleTransaction(transactionId, { status: Status.PENDING, bankComment, bankRefId })

            const notification = await NotificationService.addNotification({
                id: uuidv4(),
                title: 'Failed transaction',
                heading: 'Failed transaction',
                message: `
                    Failed transaction for ${meter.meterNumber} with amount ${amount}

                    Bank Ref: ${bankRefId}
                    Bank Comment: ${bankComment}
                    Transaction Id: ${transactionId}                    
                    `,
                entityId: partnerEntity.id,
                read: false,
            })

            // Check if partner wants to receive notifications for failed transactions
            if (partnerEntity.notificationSettings.failedTransactions) {
                await NotificationUtil.sendNotificationToUser(partnerEntity.id, notification)
            }

            throw new GateWayTimeoutError('Transaction timeout')
        }

        const discoLogo = DISCO_LOGO[transaction.disco.toLowerCase() as keyof typeof DISCO_LOGO]

        // Add Power Unit to store token 
        const newPowerUnit: PowerUnit = await PowerUnitService.addPowerUnit({
            id: uuidv4(),
            transactionId: transactionId,
            disco: transaction.disco,
            discoLogo,
            amount: amount,
            meterId: meter.id,
            superagent: transaction.superagent,
            address: meter.address,
            token: NODE_ENV === 'development' ? generateRandomToken() : tokenInfo.data.token,
            tokenNumber: tokenInfo.token,
            tokenUnits: tokenInfo.units
        })

        // Update Transaction
        // TODO: Add request token event to transaction
        await EventService.addEvent({
            id: uuidv4(),
            eventTimestamp: new Date(),
            status: Status.COMPLETE,
            eventType: 'REQUEST_TOKEN',
            eventText: 'Request token',
            source: 'API',
            eventData: JSON.stringify({}),
            transactionId: transactionId,
        })

        await TransactionService.updateSingleTransaction(transactionId, { amount, bankRefId, bankComment, status: Status.COMPLETE })

        EmailService.sendEmail({
            to: user.email,
            subject: 'Token Purchase',
            html: await new EmailTemplate().receipt({
                transaction: transaction,
                meterNumber: meter?.meterNumber,
                token: newPowerUnit.token
            })
        }).then(async (r) => {
            await EventService.addEvent({
                id: uuidv4(),
                eventTimestamp: new Date(),
                status: Status.COMPLETE,
                eventType: 'TOKEN_SENT',
                eventText: 'Sent token',
                source: 'API',
                eventData: JSON.stringify({
                    userEmail: user.email
                }),
                transactionId: transactionId,
            })
        })

        res.status(200).json({
            status: 'success',
            message: 'Token retrieved successfully',
            data: {
                newPowerUnit: ResponseTrimmer.trimPowerUnit(newPowerUnit)
            }
        })
    }

    static async getDiscos(req: Request, res: Response) {
        let discos: { name: string, serviceType: 'PREPAID' | 'POSTPAID' }[] = []

        switch (DEFAULT_ELECTRICITY_PROVIDER) {
            case 'BAXI':
                discos = await VendorService.baxiFetchAvailableDiscos()
                break
            case 'BUYPOWERNG':
                discos = await VendorService.buyPowerFetchAvailableDiscos()
                break
            default:
                discos = []
                break
        }

        res.status(200).json({
            status: 'success',
            message: 'Discos retrieved successfully',
            data: {
                discos: discos
            }
        })
    }

    static async checkDisco(req: Request, res: Response) {
        const { disco } = req.query

        let result = false
        switch (DEFAULT_ELECTRICITY_PROVIDER) {
            case 'BAXI':
                result = await VendorService.baxiCheckDiscoUp(disco as string)
                break;
            case 'BUYPOWERNG':
                result = await VendorService.buyPowerCheckDiscoUp(disco as string)
                break;
            default:
                throw new InternalServerError('An error occured')
        }

        res.status(200).json({
            status: 'success',
            message: 'Disco check successful',
            data: {
                discAvailable: result
            }
        })
    }

    static async confirmPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const { bankRefId } = req.body

        const transaction = await TransactionService.viewSingleTransactionByBankRefID(bankRefId)
        if (!transaction) throw new NotFoundError('Transaction not found')

        const meter = await transaction.$get('meter')
        if (!meter) throw new InternalServerError('Transaction does not have a meter')

        const partner = await transaction.$get('partner')
        const entity = await partner?.$get('entity')
        if (!entity) throw new InternalServerError('Entity not found')

        // Check event for request token
        const requestTokenEvent = await Event.findOne({
            where: { transactionId: transaction.id, eventType: 'REQUEST_TOKEN' }
        })

        if (!requestTokenEvent) {
            throw new BadRequestError('Request token event not found')
        }

        await EventService.addEvent({
            id: uuidv4(),
            eventTimestamp: new Date(),
            status: Status.COMPLETE,
            eventType: 'CONFIRM_PAYMENT',
            eventText: 'Confirm payment',
            source: 'API',
            eventData: JSON.stringify({}),
            transactionId: transaction.id,
        })

        res.status(200).json({
            status: 'success',
            message: 'Payment confirmed successfully',
            data: {
                transaction: {
                    transactionId: transaction.id,
                    status: transaction.status,
                },
                meter: {
                    disco: meter.disco,
                    number: meter.meterNumber,
                    address: meter.address,
                    phone: meter.userId,
                    vendType: meter.vendType,
                    name: meter.userId,
                }
            }
        })
    }
}