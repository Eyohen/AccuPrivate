import jwt from "jsonwebtoken";
import { IPartnerProfile } from "../../models/Entity/Profiles/PartnerProfile.model";
import { ENCRYPTION_KEY, JWT_SECRET } from "../Constants";
import { redisClient } from "../../models";
import { ITeamMemberProfile } from "../../models/Entity/Profiles/TeamMemberProfile.model";
import { IEntity } from "../../models/Entity/Entity.model";
import Role, { RoleEnum } from "../../models/Role.model";
import RoleService from "../../services/Role.service";

interface SaveTokenToCache {
    key: string,
    token: string,
    expiry?: number
}

class TokenUtil {
    static async encodeToken(payload: string, expiry?: number) {
        // Token without expire
        if (!expiry) return jwt.sign(payload, ENCRYPTION_KEY)
        else return jwt.sign(payload, ENCRYPTION_KEY, { expiresIn: expiry })
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
        return _token === token
    }

    static async deleteTokenFromCache(key: string) {
        await redisClient.del(key)
    }
}

export type AuthToken = 'access' | 'refresh' | 'passwordreset' | 'emailverification'
interface GenerateTokenData {
    type: AuthToken,
    profile: IPartnerProfile | ITeamMemberProfile,
    entity: IEntity
    expiry: number,
    misc?: Record<string, any>
}

interface CompareTokenData {
    tokenType: AuthToken,
    entity: IEntity,
    token: string
}

interface DeleteToken {
    tokenType: AuthToken,
    tokenClass: 'token' | 'code',
    entity: IEntity
}

export interface DecodedTokenData {
    user: {
        profile: IPartnerProfile | ITeamMemberProfile,
        entity: IEntity & { role: RoleEnum }
    },
    misc: Record<string, any>,
    token: string
}

class AuthUtil {
    static async generateToken(info: GenerateTokenData) {
        const { type, profile, entity, expiry, misc } = info

        const role = await RoleService.viewRoleById(entity.roleId)
        if (!role) {
            throw new Error('Role not found')
        }

        const tokenKey = `${type}_token:${entity.id}`
        const token = jwt.sign({ userInfo: { profile, entity: { ...entity, role: role.name } }, misc: { ...misc, tokenType: type } }, JWT_SECRET, { expiresIn: info.expiry })

        await TokenUtil.saveTokenToCache({ key: tokenKey, token, expiry })

        return token
    }

    static async generateCode({ type, entity, expiry }: Pick<GenerateTokenData, 'entity' | 'type' | 'expiry'>) {
        const tokenKey = `${type}_code:${entity.id}`
        const token = Math.floor(100000 + Math.random() * 900000).toString()

        await TokenUtil.saveTokenToCache({ key: tokenKey, token, expiry })

        return token
    }

    static compareToken({ entity, tokenType, token }: Omit<CompareTokenData, 'misc'>) {
        const tokenKey = `${tokenType}_token:${entity.id}`
        return TokenUtil.compareToken(tokenKey, token)
    }

    static compareCode({ entity, tokenType, token }: Omit<CompareTokenData, 'misc'>) {
        const tokenKey = `${tokenType}_code:${entity.id}`
        return TokenUtil.compareToken(tokenKey, token)
    }

    static verifyToken(token: string) {
        return jwt.verify(token, JWT_SECRET)
    }

    static verifyCode(code: string) {

    }

    static async deleteToken({ entity, tokenType, tokenClass }: DeleteToken) {
        const tokenKey = `${tokenType}_${tokenClass}:${entity.id}`
        await TokenUtil.deleteTokenFromCache(tokenKey)
    }
}

export { AuthUtil, TokenUtil }