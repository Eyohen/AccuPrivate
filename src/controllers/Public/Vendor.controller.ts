import { Request, Response } from "express";
import TransactionService from "../../services/Transaction.service";
import Transaction , {PaymentType, Status} from "../../models/Transaction.model";
import { v4 as uuidv4 } from 'uuid';
import UserService from "../../services/User.service";
import MeterService from "../../services/Meter.service";
import User from "../../models/User.model";
import Meter from "../../models/Meter.model";
import VendorService from "../../services/Vendor.service";
import PowerUnit from "../../models/PowerUnit.model";
import PowerUnitService from "../../services/PowerUnit.service";

interface valideMeterRequestBody { 
    meterNumber : string  
    venderType: string
    disco: string
    phoneNumber: string
    partnerName: string
    email: string 
} 


interface vendTokenRequestBody { 
    meterNumber : string  
    venderType: string
    disco: string
    phoneNumber: string
    partnerName: string
    email: string 
} 


export default class VendorController{
    
    static async validateMeter(req: Request , res: Response){
        const {
            meterNumber,
            venderType,
            disco,
            partnerName,
            phoneNumber,
            email, 
        } : valideMeterRequestBody = req.body 
        try{
            const transaction: Transaction | Error = await TransactionService.addTransaction({
                id: uuidv4(), 
                Amount: '0', 
                Status: Status.PENDING , 
                Payment_type: PaymentType.PAYMENT, 
                Transaction_timestamp: new Date(),
                Disco: disco, 
                Superagent: "BUYPOWERNG", 
            })

            let transactionId :string = ''
            if(transaction instanceof Transaction){
                transactionId = transaction.id
            }

            // We Check for Meter User 
            const response = await  VendorService.buyPowerValidateMeter({
                transactionId,
                meterNumber,
                disco,
            })

            //Add User
            const user: User | Error = await UserService.addUser({
                id: uuidv4() ,             
                Address: response.address ,        
                Email: email,          
                Name: response.name ,           
                Phone_number: phoneNumber,
            }, transaction)

            let userId: string = ''
            if(user instanceof User && transaction instanceof Transaction){
                userId = user.id
            }
            
            
            
           
            //Add Meter 
            const meter: Meter | void = await MeterService.addMeter({
                id : uuidv4(),
                address : response.address ,
                Meter_number: meterNumber,
                UserId: userId,
                Disco: disco
            })

            if(transaction instanceof Transaction && meter instanceof Meter && user instanceof User  ){
                res.status(200).json({
                    transaction : {
                        transactionId : transaction.id,
                        Status: transaction.Status,
                    },
                    meter: {
                        disco: meter.Disco,
                        number: meter.Meter_number,
                        address: meter.address,
                        phone: user.Phone_number,
                        name: user.Name
                    }
                })
            }else{
                throw Error()
            }
            

        }catch(err){
            res.status(400).json(
                {
                    error : true,
                    message: 'Something went wrong opss'
                }
            )
        }
        

    }


    static async requestToken(req: Request, res:Response){
        const {
            meterNumber,
            transactionId,
            phoneNumber,
            BankRefID,
            BankComment,
            Amount,
            disco,
            isDebit
        } = req.body

        if(!isDebit) return res.status(400).json({error: true, message: 'Transaction must be completed'})
        if(!BankRefID) return res.status(400).json({error: true, message: 'Transaction reference is required'})

        try{
            //Check if Disco is Up
            const checKDisco: boolean | Error = await VendorService.buyPowerCheckDiscoUp(disco)
            if(!checKDisco) return res.status(400).json({error: true, message:'Disco is currently down'})

            //request token

            const tokenInfo = await VendorService.buyPowerVendToken({
                transactionId,
                meterNumber,
                disco,
                amount: Amount,
                phone: phoneNumber,
            })


            console.log(tokenInfo)

            //Get Meter 
            const meter : Meter | void |null = await MeterService.veiwSingleMeterByMeterNumber(meterNumber)
            let meterId = ''
            let meterAddress = ''
            if(meter instanceof Meter){
                meterId = meter.id
                meterAddress = meter.address
            }


            // add PowerUnit 
            const newPowerUnit: PowerUnit | void = await PowerUnitService.addPowerUnit({
                id : uuidv4(),
                TransactionId : transactionId,
                Disco: disco,
                Amount: Amount,
                MeterId: meterId,
                Superagent: 'BUYPOWER',
                Address: meterAddress,
                Token_number: tokenInfo.token,
                Token_units: tokenInfo.units
            })

            //update Transaction
            await TransactionService.updateSingleTransaction(transactionId,{Amount})

            //return PowerUnit
            res.status(200).json({
                newPowerUnit
            })

        }catch(err: any){
            console.log(err)
            res.status(400).json(
                {
                    error : true,
                    message: err?.response.data.message
                }
            )
        }



        
    }

    static async completeTransaction(req:Request, res:Response){

    }

}