import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts'
import { compare, hash } from '../../utils/hash.ts'
import db from "../../sqlite.ts";
import { iUser, tuser } from './interface.ts'
import { generateToken } from '../../utils/token.ts'

export class User implements iUser {

    async get(id: string) {
        const u = db
            .prepare('select id, created_at, username, displayname, email, avatar from users where id = ?')
            .get<tuser>(id)
        if (!u) throw new Error('not found')
        return u
    }

    async register(email: string, password: string) {
        const parsedEmail = z.string().email().safeParse(email)
        if (!parsedEmail.success) throw new Error('Invalid email')
        try {
            db.prepare(`insert into users (email, password, username) values (?, ?, ?)`)
                .run(email, await hash(password), getDisponibility(email.split('@')[0]))
            const x = db
                .prepare('select id, created_at, username, displayname, email, avatar from users where email = ?')
                .get<tuser>(email)
            if (!x) throw new Error('not register')
            return x
        } catch (error) {
            if ((error as Error).message.includes('UNIQUE constraint failed: users.email'))
                throw new Error('email registrado')
            throw new Error(error.message)
        }
    }

    async login(email: string,password: string): Promise<{ token: string; expires: number }> {
        const u = db.prepare('select * from users where email = ?')
            .get<tuser & {password: string}>(email)        
        if (!u) throw new Error('Invalid user or password')
        if (!(await compare(password, u.password))) throw new Error('Invalid user or password')
        return generateToken({
            id: u.id,
            created_at: u.created_at,
            username: u.username,
            displayname: u.displayname,
            email: u.email,
            avatar: u.avatar
        })
    }
}

function getDisponibility(username: string) {
    const users = db
        .prepare('select username from users where username like ?')
        .values(`%${username}%`)
        .flat()
    if (users.length == 0) return username
    const next = (num: number): string => {
        if (users.includes(`${username}${num}`)) return next(num+1)
        return `${username}${num}`
    }
    return next(1)
}