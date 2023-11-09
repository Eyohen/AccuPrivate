import PowerUnit from "../models/PowerUnit.model";
import { ICreatePowerUnit } from "../models/PowerUnit.model";
export default class PowerUnitService {

    static async addPowerUnit(powerUnit: ICreatePowerUnit): Promise<PowerUnit> {
        const newPowerUnit: PowerUnit = PowerUnit.build(powerUnit)
        await newPowerUnit.save()
        return newPowerUnit
    }

    static async viewPowerUnitByToken(token: string): Promise<PowerUnit | null> {
        const powerUnit: PowerUnit | null = await PowerUnit.findOne({ where: { token } })
        return powerUnit
    }

    static async viewPowerUnitsWithCustomQuery(query: any): Promise<PowerUnit[]> {
        const powerUnits: PowerUnit[] = await PowerUnit.findAll(query)
        return powerUnits
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