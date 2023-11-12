import jwt from "jsonwebtoken";
import { IPartner } from "../../models/Partner.model";
import { ENCRYPTION_KEY, JWT_SECRET } from "../Constants";
import { redisClient } from "../../models";

interface SaveTokenToCache {
    key: string,
    token: string,
    expiry?: number
}

class TokenUtil {
    static async encodeToken(payload: string, expiry: number) {
        return jwt.sign(payload, ENCRYPTION_KEY, { expiresIn: expiry })
    }

    static async decodeToken(token: string) {
        return jwt.verify(token, ENCRYPTION_KEY)
    }

    static saveTokenToCache({ key, token, expiry }: SaveTokenToCache) {
        const response = expiry ? redisClient.setex(key, expiry, token) : redisClient.set(key, token)
        return response
    }

    static async getTokenFromCache(key: string): Promise<string | null> {
        const token = redisClient.get(key)
        return token
    }

    static async compareToken(key: string, token: string) {
        const _token = await TokenUtil.getTokenFromCache(key)
        return _token !== token
    }

    static async deleteTokenFromCache(key: string) {
        await redisClient.del(key)
    }
}

type AuthToken = 'access' | 'refresh' | 'passwordreset' | 'emailverification'
interface GenerateTokenData {
    type: AuthToken,
    partner: IPartner,
    expiry: number,
    misc?: Record<string, any>
}

interface CompareTokenData {
    tokenType: AuthToken,
    partner: IPartner,
    token: string
}

class AuthUtil {
    static async generateToken(info: GenerateTokenData) {
        const { type, partner, expiry, misc } = info

        const tokenKey = `${type}_token:${partner.id}`
        const token = jwt.sign({ partner, misc }, JWT_SECRET, { expiresIn: info.expiry })

        await TokenUtil.saveTokenToCache({ key: tokenKey, token, expiry })

        return token
    }
    
    static async generateCode(info: GenerateTokenData) {
        const { type, partner, expiry, misc } = info

        const tokenKey = `${type}_code:${partner.id}`
        const token = Math.floor(100000 + Math.random() * 900000).toString()

        await TokenUtil.saveTokenToCache({ key: tokenKey, token, expiry })

        return token
    }

    static compareToken({ partner, tokenType, token }: Omit<CompareTokenData, 'misc'>) {
        const tokenKey = `${tokenType}_token:${partner.id}`
        return TokenUtil.compareToken(tokenKey, token)
    }
    
    static compareCode({ partner, tokenType, token }: Omit<CompareTokenData, 'misc'>) {
        const tokenKey = `${tokenType}_code:${partner.id}`
        return TokenUtil.compareToken(tokenKey, token)
    }

    static verifyToken(token: string) {
        return jwt.verify(token, JWT_SECRET)
    }

    static verifyCode(code: string) {
        
    }
}

export { AuthUtil, TokenUtil }