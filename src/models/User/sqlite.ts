import { z } from '@zod/mod.ts'
import { compare, hash } from '@utils/hash.ts'
import db, { sql } from '@db/sqlite.ts'
import { iUser, tRegister, tUser } from '@interfaces/User.ts'
import { generateToken } from '@utils/token.ts'
import { Sentry } from '@error'
import { TOKEN_TYPES, tTokenType } from '@constants'

export class User implements iUser {
    // deno-lint-ignore require-await
    async get(id: number): Promise<tUser> {
        const u = sql.get<tUser>`
        select id, created_at, username, displayname, avatar, email 
        from users 
        where id = ${id}`
        if (!u) throw new Error('not found')
        return u
    }

    async login(
        email: string,
        password: string,
    ): Promise<{ token: string; expires: number; type: tTokenType }> {
        try {
            const [req] = db.sql<tRegister>`
            select *
            from registers
            where email = ${email}`
            if (!req) throw new Error('Invalid user or password')
            if (!(await compare(password, req.password))) {
                throw new Error('Invalid user or password')
            }
            if (req.user_id) {
                const user = await this.get(req.user_id)
                return generateToken({
                    email: req.email,
                    id: req.id,
                    created_at: req.created_at,
                    user,
                    type: TOKEN_TYPES.Bearer,
                })
            }
            return generateToken({
                email: req.email,
                id: req.id,
                created_at: req.created_at,
                type: TOKEN_TYPES.Register,
            })
        } catch (error) {
            console.error(error)
            Sentry.captureException(error)
            throw new Error('Internal Server Error')
        }
    }

    async register(email: string, password: string): Promise<tRegister> {
        const parsedEmail = z.string().email().safeParse(email)
        if (!parsedEmail.success) throw new Error('Invalid email')
        try {
            const [r] = db.sql<tRegister>`
            select *
            from registers
            where email = ${email}`
            if (r) throw new Error('Email already registered')
            db.sql`
            INSERT INTO registers (
                email, 
                password
            ) 
            VALUES (
                ${email},
                ${await hash(password)}
            )`
            const [u] = db.sql<tRegister>`
            select *
            from registers
            where email = ${email}`
            return u
        } catch (error) {
            console.error(error)
            Sentry.captureException(error)
            throw new Error('Internal Server Error')
        }
    }

    // deno-lint-ignore require-await
    async create(register_id: number, username: string): Promise<tUser> {
        const [reg] = db.sql<tRegister>`
        select *
        from registers
        where id = ${register_id}`
        if (!reg) throw new Error('Invalid register id')
        const [u] = db.sql<tUser>`
        select *
        from users
        where username = ${username}`
        if (u) throw new Error('Username already registered')
        try {
            db.sql`
            insert into users (
                username
            )
            values (
                ${username}
            )`
            const [user] = db.sql<tUser>`
            select *
            from users
            where username = ${username}`
            if (!user) throw new Error('Internal Server Error')
            db.sql`
            update registers
            set user_id = ${user.id}
            where id = ${register_id}`
            return user
        } catch (error) {
            console.error(error)
            Sentry.captureException(error)
            throw new Error('Internal Server Error')
        }
    }
}
