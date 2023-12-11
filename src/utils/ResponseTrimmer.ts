import Entity, { IEntity } from "../models/Entity/Entity.model"
import Partner, { IPartnerProfile } from "../models/Entity/Profiles/PartnerProfile.model"
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

    static trimPowerUnits(powerUnits: PowerUnit[]) {
        return powerUnits.map(powerUnit => this.trimPowerUnit(powerUnit))
    }

    static trimPartner(partner: IPartnerProfile & { entity: IEntity }) {
        return {
            email: partner.email,
            profilePicture: partner.entity.profilePicture,
        }
    }
}

export default ResponseTrimmer