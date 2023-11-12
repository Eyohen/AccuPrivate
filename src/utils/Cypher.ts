import bcrypt from 'bcrypt'

class Cypher {
    static hashPassword(password: string): string {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }

    static comparePassword(password: string, hash: string): boolean {
        return bcrypt.compareSync(password, hash);
    }
}

export default Cypher;