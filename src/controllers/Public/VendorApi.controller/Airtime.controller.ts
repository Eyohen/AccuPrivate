import { NextFunction, Request, Response } from "express";
import TransactionService from "../../../services/Transaction.service";
import Transaction, {
    PaymentType,
    Status,
    TransactionType,
} from "../../../models/Transaction.model";
import { v4 as uuidv4 } from "uuid";
import UserService from "../../../services/User.service";
import {
    BadRequestError,
    InternalServerError,
    NotFoundError,
} from "../../../utils/Errors";
import { VendorPublisher } from "../../../kafka/modules/publishers/Vendor";
import { CRMPublisher } from "../../../kafka/modules/publishers/Crm";
import { AirtimeTransactionEventService } from "../../../services/TransactionEvent.service";
import { Database } from "../../../models";
import ProductService from "../../../services/Product.service";
import Vendor from "../../../models/Vendor.model";
import VendorProduct, { VendorProductSchemaData } from "../../../models/VendorProduct.model";
import { TokenHandlerUtil } from "../../../kafka/modules/consumers/Token";
import { BAXI_AGENT_ID, HTTP_URL, SCHEMADATA, SEED, SEED_DATA } from "../../../utils/Constants";
import Product from "../../../models/Product.model";
import { randomUUID } from "crypto";
import VendorService from "../../../services/Vendor.service";
import VendorProductService from "../../../services/VendorProduct.service";
import { generateRandomString, generateRandonNumbers } from "../../../utils/Helper";
import logger from "../../../utils/Logger";


class AirtimeValidator {
    static validatePhoneNumber(phoneNumber: string) {
        if (phoneNumber.length !== 11) {
            throw new BadRequestError("Invalid phone number");
        }

        if (phoneNumber[0] !== "0") {
            throw new BadRequestError("Invalid phone number");
        }

        const regex = new RegExp("^[0-9]+$");
        if (!regex.test(phoneNumber)) {
            throw new BadRequestError("Invalid phone number");
        }
    }

    static async validateAirtimeRequest({ phoneNumber, amount, disco }: { phoneNumber: string, amount: string, disco: string }) {
        AirtimeValidator.validatePhoneNumber(phoneNumber);
        // Check if amount is a number
        if (isNaN(Number(amount))) {
            throw new BadRequestError("Invalid amount");
        }

        if (parseFloat(amount) < 50) {
            throw new BadRequestError("Amount must be greater than 50");
        }

        const productCode = await ProductService.viewSingleProductByMasterProductCode(disco)
        if (!productCode) {
            throw new InternalServerError('Product code not found')
        }
    }

    static async requestAirtime({ transactionId, bankRefId, bankComment }: { transactionId: string, bankRefId: string, bankComment: string }) {
        if (!transactionId || !bankRefId || !bankComment) {
            throw new BadRequestError("Transaction ID, bank reference ID, and bank comment are required");
        }

        const transactionRecord = await TransactionService.viewSingleTransaction(transactionId);
        if (!transactionRecord) {
            throw new NotFoundError("Transaction not found");
        }
    }


}

export class AirtimeVendController {
    static async validateAirtimeRequest(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const { phoneNumber, amount, email, networkProvider } = req.body;
        let disco = networkProvider

        const existingProductCodeForDisco = await ProductService.viewProductCodeByProductName(disco)
        if (!existingProductCodeForDisco) {
            throw new NotFoundError('Product code not found for disco')
        }

        disco = existingProductCodeForDisco.masterProductCode

        // TODO: Add request type for request authenticated by API keys
        const partnerId = (req as any).key

        // TODO: I'm using this for now to allow the schema validation since product code hasn't been created for airtime
        if (existingProductCodeForDisco.category !== 'AIRTIME') {
            throw new BadRequestError('Invalid product code for airtime')
        }

        const reference = generateRandomString(10)

        const superAgent = await TokenHandlerUtil.getBestVendorForPurchase(existingProductCodeForDisco.id, 1000);
        const transaction: Transaction =
            await TransactionService.addTransactionWithoutValidatingUserRelationship({
                id: uuidv4(),
                amount: amount,
                status: Status.PENDING,
                disco: disco,
                superagent: superAgent,
                paymentType: PaymentType.PAYMENT,
                transactionTimestamp: new Date(),
                partnerId: partnerId,
                reference,
                networkProvider: networkProvider,
                productType: existingProductCodeForDisco.category,
                vendorReferenceId: superAgent === 'IRECHARGE' ? generateRandonNumbers(10) : reference,
                transactionType: TransactionType.AIRTIME,
                productCodeId: existingProductCodeForDisco.id,
                previousVendors: [superAgent],
                retryRecord: []
            });

        const transactionEventService = new AirtimeTransactionEventService(transaction, superAgent, partnerId, phoneNumber);
        await transactionEventService.addPhoneNumberValidationRequestedEvent()

        AirtimeValidator.validateAirtimeRequest({ phoneNumber, amount, disco });
        await transactionEventService.addPhoneNumberValidationRequestedEvent()

        const userInfo = {
            id: uuidv4(),
            phoneNumber: phoneNumber,
            amount: amount,
            email: email,
        }
        await transactionEventService.addCRMUserInitiatedEvent({ user: userInfo })
        CRMPublisher.publishEventForInitiatedUser({ user: userInfo, transactionId: transaction.id })

        const sequelizeTransaction = await Database.transaction()
        try {
            const user = await UserService.addUserIfNotExists({
                id: userInfo.id,
                email: email,
                phoneNumber: phoneNumber,
            }, sequelizeTransaction);
            console.log('pre update')
            await transaction.update({ userId: user.id }, { transaction: sequelizeTransaction })
            console.log('post update')
            await sequelizeTransaction.commit()
        } catch (error) {
            await sequelizeTransaction.rollback()
            throw error
        }

        res.status(200).json({
            message: "Request validated successfully",
            data: {
                transaction: {
                    transactionId: transaction.id,
                    status: transaction.status,
                },
            },
        })
    }

    static async seedDataToDb(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        console.log('Start seeding data to the database...');

        const productCategories = ['POSTPAID', 'PREPAID'] as const;
        const vendors = ['IRECHARGE', 'BUYPOWERNG', 'BAXI'] as const;
        const productTypes = Object.keys(SEED);

        const vendorDoc = {} as {
            BUYPOWERNG: Vendor,
            IRECHARGE: Vendor,
            BAXI: Vendor,
        };

        // Create vendors
        for (let i = 0; i < vendors.length; i++) {
            const vendorName = vendors[i] as typeof vendors[number];
            console.log(`Creating vendor: ${vendorName}`);
            const existingVendor = await VendorService.viewSingleVendorByName(vendorName);
            const vendor = existingVendor ?? await VendorService.addVendor({
                name: vendorName,
                id: randomUUID(),
                schemaData: SCHEMADATA[vendorName],
            });

            vendorDoc[vendorName] = vendor;
            console.log(`Vendor ${vendorName} created with ID ${vendor.id}`);
        }

        // Create vendor products
        for (let j = 0; j < productTypes.length; j++) {
            const productType = productTypes[j] as keyof typeof SEED;
            console.log(`Creating products for type: ${productType}`);
            const productCodeData = SEED[productType];
            const productNames = Object.keys(productCodeData);

            for (let k = 0; k < productNames.length; k++) {
                const productCode = productNames[k];
                console.log(`Creating product: ${productCode}`);
                const productInfo = productCodeData[productCode as keyof typeof productCodeData] as unknown as typeof SEED.ELECTRICITY.ECABEPS;

                const productData = {
                    masterProductCode: productCode,
                    category: productType,
                    type: productInfo.type as 'PREPAID' | 'POSTPAID',
                    productName: productInfo.productName,
                    id: randomUUID(),
                } as any

                if (productType === 'AIRTIME') {
                    delete productData.type;
                }
                // Create product
                const product = await ProductService.addProduct(productData);

                console.log(`Product ${productCode} created with ID ${product.id}`);

                // Get the vendors in productInfo and create a vendorProduct using the vendor and product
                const vendors = Object.keys(productInfo.vendors);
                for (let l = 0; l < vendors.length; l++) {
                    const vendorName = vendors[l] as keyof typeof productInfo.vendors;
                    const vendor = vendorDoc[vendorName];

                    console.log(`Adding VendorProduct for vendor ${vendorName} and product ${productCode}`);
                    await VendorProductService.addVendorProduct({
                        id: randomUUID(),
                        vendorId: vendor.id,
                        productId: product.id,
                        commission: productInfo.vendors[vendorName].commission,
                        bonus: productInfo.vendors[vendorName].bonus,
                        productCode: product.masterProductCode,
                        schemaData: {
                            code: productInfo.vendors[vendorName].discoCode,
                        },
                        vendorCode: productInfo.vendors[vendorName].discoCode,
                        vendorName: vendorName,
                        vendorHttpUrl: HTTP_URL[vendorName][productType],
                    });

                    console.log(`VendorProduct added for vendor ${vendorName} and product ${productCode}`);
                }
            }
        }

        console.log('Data seeding completed.');
    }

    static async seedDataBundlesToDb(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        console.log('Start seeding data to the database...');

        const vendors = ['IRECHARGE', 'BAXI', 'BUYPOWERNG'] as const;
        const productTypes = ['MTN', 'AIRTEL', '9MOBILE', 'GLO'] as const;

        const vendorDoc = {} as {
            BUYPOWERNG: Vendor,
            IRECHARGE: Vendor,
            BAXI: Vendor,
        };

        // Create vendors
        for (let i = 0; i < vendors.length; i++) {
            const vendorName = vendors[i] as typeof vendors[number];
            console.log(`Creating vendor: ${vendorName}`);
            const existingVendor = await VendorService.viewSingleVendorByName(vendorName);
            const vendor = existingVendor ?? await VendorService.addVendor({
                name: vendorName,
                id: randomUUID(),
                schemaData: SCHEMADATA[vendorName],
            });
            for (let i = 0; i < vendors.length; i++) {
                const vendorName = vendors[i] as typeof vendors[number];
                console.log(`Creating vendor: ${vendorName}`);
                const existingVendor = await VendorService.viewSingleVendorByName(vendorName);
                const vendor = existingVendor ?? await VendorService.addVendor({
                    name: vendorName,
                    id: randomUUID(),
                    schemaData: SCHEMADATA[vendorName],
                });

                vendorDoc[vendorName] = vendor;
                console.log(`Vendor ${vendorName} created with ID ${vendor.id}`);

                vendorDoc[vendorName] = vendor;
                console.log(`Vendor ${vendorName} created with ID ${vendor.id}`);

                for (let j = 0; j < productTypes.length; j++) {
                    const productType = productTypes[j] as typeof productTypes[number];
                    console.log(`Creating products for type: ${productType}`);
                    const productCodeData = SEED_DATA[vendorName][productType];

                    const productCode = productType;
                    console.log(`Creating product: ${productCode}`);
                    const productInfo = productCodeData

                    const map = {
                        MTN: 'MTN',
                        AIRTEL: 'ATL',
                        '9MOBILE': '9MB',
                        GLO: 'GLO',
                    }
                    const productData = {
                        masterProductCode: `TC${map[productCode]}VD`,
                        category: 'DATA',
                        productName: productType,
                        id: randomUUID(),
                    } as any

                    // Create product
                    const product = await ProductService.viewSingleProductByMasterProductCode(productData.masterProductCode) ?? await ProductService.addProduct(productData);
                    console.log(`Product ${productCode} created with ID ${product.id}`);

                    const commissions = {
                        IRECHARGE: {
                            MTN: 0.025,
                            AIRTEL: 0.03,
                            '9MOBILE': 0.035,
                            GLO: 0.04,
                        },
                        BUYPOWERNG: {
                            MTN: 0.00,
                            AIRTEL: 0.00,
                            '9MOBILE': 0.00,
                            GLO: 0.00,
                        },
                        BAXI: {
                            MTN: 0.02,
                            AIRTEL: 0.02,
                            '9MOBILE': 0.03,
                            GLO: 0.035,
                        },
                    }

                    const IRECHARGEDATACODE = {
                        'MTN': 'MTN',
                        'AIRTEL': 'Airtel',
                        'GLO': 'Glo',
                        '9MOBILE': 'Etisalat'
                    }

                    for (let m = 0; m < productInfo.length; m++) {
                        const dataBundle = productInfo[m];

                        // console.log(`Adding VendorProduct for vendor ${vendorName} and product ${productCode}`);
                        await VendorProductService.addVendorProduct({
                            id: randomUUID(),
                            vendorId: vendor.id,
                            productId: product.id,
                            commission: commissions[vendorName][productType],
                            bonus: 0,
                            bundleAmount: parseFloat(dataBundle.price.toString()),
                            productCode: product.masterProductCode,
                            schemaData: {
                                bundleName: dataBundle.title,
                                validity: dataBundle.validity,
                                datacode: dataBundle.code,
                                code: vendorName === 'IRECHARGE' ? IRECHARGEDATACODE[productType] : productType,
                            },
                            vendorHttpUrl: HTTP_URL[vendorName]['DATA'],
                            vendorName: vendorName,
                            vendorCode: vendorName === 'IRECHARGE' ? IRECHARGEDATACODE[productType] : productType,
                        });

                        console.log(`VendorProduct added for vendor ${vendorName} and Code}`);
                    }
                }
            }
        }
    }

    // Create vendor products

    static async requestAirtime(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const { transactionId, bankRefId, bankComment } = req.query as Record<string, string>;

        const transaction: Transaction | null =
            await TransactionService.viewSingleTransaction(transactionId);
        if (!transaction) {
            throw new NotFoundError("Transaction not found");
        }

        const user = await transaction.$get('user')
        if (!user) {
            throw new InternalServerError('User record not found for already validated request')
        }

        const partner = await transaction.$get('partner')
        if (!partner) {
            throw new InternalServerError('Partner record not found for already validated request')
        }

        // Check if transaction is already completed    
        if (transaction.status === Status.COMPLETE) {
            throw new BadRequestError("Transaction already completed");
        }

        // Check if reference has been used before
        const existingTransaction: Transaction | null = await TransactionService.viewSingleTransactionByBankRefID(bankRefId);
        if (existingTransaction) {
            throw new BadRequestError("Duplicate reference");
        }

        const transactionEventService = new AirtimeTransactionEventService(transaction, transaction.superagent, transaction.partnerId, user.phoneNumber);
        await transactionEventService.addAirtimePurchaseInitiatedEvent({ amount: transaction.amount })

        await TransactionService.updateSingleTransaction(transactionId, {
            status: Status.PENDING,
            bankRefId: bankRefId,
            bankComment: bankComment,
        });

        await VendorPublisher.publshEventForAirtimePurchaseInitiate({
            transactionId: transactionId,
            phone: {
                phoneNumber: user.phoneNumber,
                amount: parseFloat(transaction.amount),
            },
            superAgent: transaction.superagent,
            partner: partner,
            user: user,
        })

        res.status(200).json({
            message: "Airtime request sent successfully",
            data: { 
                transaction: { 
                    // ...transaction.dataValues, 
                    // removed to add proper mapping
                    "amount": transaction.dataValues?.amount,
                    "transactionId" : transaction.dataValues?.id,
                    "id" : transaction.dataValues?.id,
                    "productType": transaction.dataValues?.productType,
                    "transactionTimestamp": transaction.dataValues?.transactionTimestamp,
                    "networkProvider": transaction.dataValues?.networkProvider,
                    // disco: undefined 
                } 
            },
        })
    }

    static async confirmPayment(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const { transactionId, bankRefId, bankComment } = req.body;

        const transaction: Transaction | null =
            await TransactionService.viewSingleTransaction(transactionId);
        if (!transaction) {
            throw new NotFoundError("Transaction not found");
        }

        const user = await transaction.$get('user')
        if (!user) {
            throw new InternalServerError('User record not found for already validated request')
        }

        const partner = await transaction.$get('partner')
        if (!partner) {
            throw new InternalServerError('Partner record not found for already validated request')
        }

        const transactionEventService = new AirtimeTransactionEventService(transaction, transaction.superagent, transaction.partnerId, user.phoneNumber);
        await transactionEventService.addAirtimePurchaseConfirmedEvent()

        await TransactionService.updateSingleTransaction(transactionId, {
            status: Status.COMPLETE,
            bankRefId: bankRefId,
            bankComment: bankComment,
        });

        await VendorPublisher.publishEventForAirtimePurchaseComplete({
            transactionId: transactionId,
            phone: {
                phoneNumber: user.phoneNumber,
                amount: parseFloat(transaction.amount),
            },
            superAgent: transaction.superagent,
            partner: partner,
            user: user,
        })

        res.status(200).json({
            message: "Airtime payment confirmed successfully",
            data: {
                transaction: {
                    transactionId: transaction.id,
                    status: transaction.status,
                },
            },
        })
    }
}