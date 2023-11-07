import PowerUnit from "../models/PowerUnit.model";
import { IPowerUnit, ICreatePowerUnit } from "../models/PowerUnit.model";
import logger from "../utils/Logger";
export default class PowerUnitService {

    static async addPowerUnit(powerUnit: ICreatePowerUnit): Promise<PowerUnit | void> {
        const newPowerUnit: PowerUnit = await PowerUnit.build(powerUnit)
        newPowerUnit.save()
        return newPowerUnit
    }


    static async veiwPowerUnits(): Promise<PowerUnit[] | void> {
        const PowerUnits: PowerUnit[] = await PowerUnit.findAll()
        return PowerUnits
    }

    static async veiwSinglePowerUnit(uuid: string): Promise<PowerUnit | void | null> {
        const powerUnit: PowerUnit | null = await PowerUnit.findByPk(uuid)
        return powerUnit
    }

    static async updateSinglePowerUnit() {

    }


}