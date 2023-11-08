import PowerUnit from "../models/PowerUnit.model";
import { IPowerUnit, ICreatePowerUnit } from "../models/PowerUnit.model";
import logger from "../utils/Logger";
export default class PowerUnitService {

    static async addPowerUnit(powerUnit: ICreatePowerUnit): Promise<PowerUnit> {
        const newPowerUnit: PowerUnit = PowerUnit.build(powerUnit)
        await newPowerUnit.save()
        return newPowerUnit
    }


    static async viewPowerUnits(): Promise<PowerUnit[] | void> {
        const PowerUnits: PowerUnit[] = await PowerUnit.findAll()
        return PowerUnits
    }

    static async viewSinglePowerUnit(uuid: string): Promise<PowerUnit | void | null> {
        const powerUnit: PowerUnit | null = await PowerUnit.findByPk(uuid)
        return powerUnit
    }

    static async updateSinglePowerUnit() {

    }


}