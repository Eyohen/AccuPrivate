import { redisClient } from "../models"

interface WaitTime {
    startTimeForSwitchingToNewVendor: number | null
    startTimeToRequeryTransaction: number | null
}
export default class WaitTimeService {
    static async setWaitTimeForSwitchingToNewVendor(newWaitTime: number) {
        const waitTime = {
            startTimeForSwitchingToNewVendor: newWaitTime,
        }

        redisClient.del('waitTime')
        const existingValue: string | null = await redisClient.get('waitTime')
        if (!existingValue) {
            const response = await redisClient.set('waitTime', JSON.stringify({ ...waitTime, startTimeToRequeryTransaction: null }))

            return response
        }

        console.log(existingValue)
        await redisClient.set('waitTime', JSON.stringify({ ...JSON.parse(existingValue), startTimeForSwitchingToNewVendor: newWaitTime }))
        const newValue = await redisClient.get('waitTime')
        if (!newValue) return null

        return JSON.parse(newValue) as WaitTime
    }

    static async setWaitTimeToRequeryTransaction(newWaitTime: number) {
        const waitTime = {
            startTimeToRequeryTransaction: newWaitTime,
        }

        const existingValue: string | null = await redisClient.get('waitTime')
        if (!existingValue) {
            const response = await redisClient.set('waitTime', JSON.stringify({ ...waitTime, startTimeForSwitchingToNewVendor: null }))

            return response
        }

        await redisClient.set('waitTime', JSON.stringify({ ...JSON.parse(existingValue), startTimeToRequeryTransaction: newWaitTime }))
        const newValue = await redisClient.get('waitTime')
        if (!newValue) return null

        return JSON.parse(newValue) as WaitTime
    }

    static async getWaitTime() {
        const value = await redisClient.get('waitTime')
        if (!value) return null

        return JSON.parse(value) as WaitTime
    }
}