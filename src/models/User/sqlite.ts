import { z } from '@zod/mod.ts'
import { compare, hash } from '@utils/hash.ts'
import { sql } from '@db/sqlite.ts'
import { iUser, tUser } from '@interfaces/User.ts'
import { generateToken } from '@utils/token.ts'
import { Sentry } from '@error'

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
    ): Promise<{ token: string; expires: number }> {
        const u = sql.get<tUser & { password: string }>`
        select * 
        from users 
        where email = ${email}`
        if (!u) throw new Error('Invalid user or password')
        if (!await compare(password, u.password)) {
            throw new Error('Invalid user or password')
        }
        return generateToken({
            id: u.id,
            created_at: u.created_at,
            username: u.username,
            displayname: u.displayname,
            email: u.email,
            avatar: u.avatar,
        })
    }

    async register(email: string, password: string): Promise<tUser> {
        const parsedEmail = z.string().email().safeParse(email)
        if (!parsedEmail.success) throw new Error('Invalid email')
        try {
            sql.run`
            insert into users (
                email, 
                password, 
                username
            ) 
            values (
                ${email}, 
                ${await hash(password)}, 
                ${getDisponibility(email.split('@')[0])}
            )`
            const x = sql.get<tUser>`
            select id, created_at, username, displayname, email, avatar
            from users
            where email = ${email}`
            if (!x) throw new Error('not register')
            return x
        } catch (error) {
            if (
                (error as Error).message.includes(
                    'UNIQUE constraint failed: users.email',
                )
            ) {
                throw new Error('email registrado')
            }
            console.error(error)
            Sentry.captureException(error)
            throw new Error('Internal Server Error')
        }
    }
}

function getDisponibility(username: string) {
    const users = sql.values`
        select username 
        from users 
        where username 
        like %${username}%`
        .flat()
    if (users.length == 0) return username
    const next = (num: number): string => {
        if (users.includes(`${username}${num}`)) return next(num + 1)
        return `${username}${num}`
    }
    return next(1)
}
