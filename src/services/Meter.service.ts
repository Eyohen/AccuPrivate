import Meter from "../models/Meter.model";
import { IMeter, ICreateMeter } from "../models/Meter.model";
export default class MeterService{
    
    
    static async addMeter(meter: ICreateMeter): Promise<Meter | void>{
        try {
            const newMeter: Meter = await  Meter.build(meter)
            newMeter.save()
            return newMeter
        } catch (error) {
            console.log(error)
        }
    }


    static async veiwMeters(): Promise<Meter[] | void>{
        try{
            const meters: Meter[] = await Meter.findAll()
            return meters
        }catch(err){
            console.log(err)
        }
    }

    static async veiwSingleMeter(uuid: string): Promise<Meter | void | null>{
        try {
            const meter: Meter | null = await Meter.findByPk(uuid)
            return meter
        } catch (error) {
            console.log(error)
        }
    }

    static async veiwSingleMeterByMeterNumber(Meter_number: string): Promise<Meter | void | null>{
        try {
            const meter: Meter | null = await Meter.findOne({ where: {Meter_number} })
            return meter
        } catch (error) {
            console.log(error)
        }
    }

    static async updateSingleMeter(){

    }
   

}