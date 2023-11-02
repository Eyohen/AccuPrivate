import PowerUnit from "../models/PowerUnit.model";
import { IPowerUnit, ICreatePowerUnit } from "../models/PowerUnit.model";
export default class PowerUnitService{
    
    
    static async addPowerUnit(powerUnit: ICreatePowerUnit): Promise<PowerUnit | void>{
        try {
            const newPowerUnit: PowerUnit = await  PowerUnit.build(powerUnit)
            newPowerUnit.save()
            return newPowerUnit
        } catch (error) {
            console.log(error)
        }
    }


    static async veiwPowerUnits(): Promise<PowerUnit[] | void>{
        try{
            const PowerUnits: PowerUnit[] = await PowerUnit.findAll()
            return PowerUnits
        }catch(err){
            console.log(err)
        }
    }

    static async veiwSinglePowerUnit(uuid: string): Promise<PowerUnit | void | null>{
        try {
            const powerUnit: PowerUnit | null = await PowerUnit.findByPk(uuid)
            return powerUnit
        } catch (error) {
            console.log(error)
        }
    }

    static async updateSinglePowerUnit(){

    }
   

}