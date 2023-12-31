"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResponseTrimmer {
    static trimTransaction(transaction) {
        const { amount, status, paymentType, disco, bankRefId, bankComment } = transaction;
        return { amount, status, paymentType, disco, bankRefId, bankComment };
    }
    static trimPowerUnit(powerUnit) {
        return {
            address: powerUnit.address,
            disco: powerUnit.disco,
            superagent: powerUnit.superagent,
            amount: powerUnit.amount,
            tokenNumber: powerUnit.tokenNumber,
            token: powerUnit.token,
            tokenUnits: powerUnit.tokenUnits,
            meter: powerUnit.meter
        };
    }
    static trimPowerUnits(powerUnits) {
        return powerUnits.map(powerUnit => this.trimPowerUnit(powerUnit));
    }
    static trimPartner(partner) {
        return {
            address: partner.address,
            companyName: partner.companyName,
            email: partner.email,
            profilePicture: partner.entity.profilePicture,
            entityId: partner.entity.id
        };
    }
}
exports.default = ResponseTrimmer;
