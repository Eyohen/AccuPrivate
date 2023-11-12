import PowerUnit from "../models/PowerUnit.model"
import Transaction from "../models/Transaction.model"

class ResponseTrimmer {
    static trimTransaction(transaction: Transaction) {
        const { amount, status, paymentType, disco, bankRefId, bankComment } = transaction
        return { amount, status, paymentType, disco, bankRefId, bankComment }
    }

    static trimPowerUnit(powerUnit: PowerUnit) {
        return {
            address: powerUnit.address,
            disco: powerUnit.disco,
            superagent: powerUnit.superagent,
            amount: powerUnit.amount,
            tokenNumber: powerUnit.tokenNumber,
            token: powerUnit.token,
            tokenUnits: powerUnit.tokenUnits,
            meter: powerUnit.meter
        }
    }
}

export default ResponseTrimmer