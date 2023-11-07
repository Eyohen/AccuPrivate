import Meter from "../models/Meter.model";
import { IMeter, ICreateMeter } from "../models/Meter.model";
import logger from "../utils/Logger";
export default class MeterService {
    static async addMeter(meter: ICreateMeter): Promise<Meter | void> {
        const newMeter: Meter = Meter.build(meter)
        await newMeter.save()
        return newMeter
    }

    static async veiwMeters(): Promise<Meter[] | void> {
        const meters: Meter[] = await Meter.findAll()
        return meters
    }

    static async veiwSingleMeter(uuid: string): Promise<Meter | void | null> {
        const meter: Meter | null = await Meter.findByPk(uuid)
        return meter
    }

    static async veiwSingleMeterByMeterNumber(meterNumber: string): Promise<Meter | void | null> {
        const meter: Meter | null = await Meter.findOne({ where: { meterNumber } })
        return meter
    }

    static async updateSingleMeter() {

    }
}