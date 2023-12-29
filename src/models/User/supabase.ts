import { z } from '@zod/mod.ts'
import { compare, hash } from '@utils/hash.ts'
import supabase from '@db/supabase.ts'
import { iUser, tUser } from '@interfaces/User.ts'
import { generateToken } from '@utils/token.ts'
import { Sentry } from '@error'

export class User implements iUser {
    async get(id: number): Promise<tUser> {
        const req = await supabase.from('users').select().eq('id', id)
        if (req.error) {
            console.error(req.error)
            Sentry.captureException(req.error)
            throw new Error(req.error.message)
        }
        const [u] = req.data
        // @ts-ignore
        delete u.password
        return u
    }

    async register(email: string, password: string) {
        const parsedEmail = z.string().email().safeParse(email)
        if (!parsedEmail.success) throw new Error('Invalid email')
        try {
            const r = await supabase.from('users').insert({
                email,
                password: await hash(password),
                username: await getDisponibility(email.split('@')[0]),
            }).select()
            if (r.error) {
                console.error(r.error)
                Sentry.captureException(r.error)
                throw new Error(r.error.message)
            }
            return r.data[0]
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async login(
        email: string,
        password: string,
    ): Promise<{ token: string; expires: number }> {
        const req = await supabase.from('users').select().eq('email', email)
        if (!req.data?.length) throw new Error('Invalid user or password')
        const [u] = req.data
        if (!(await compare(password, u.password))) {
            throw new Error('Invalid user or password')
        }
        // @ts-ignore
        delete u.password
        return generateToken(u)
    }
}

async function getDisponibility(username: string) {
    const users = await supabase.from('users').select('username').like(
        'username',
        `${username}`,
    )
    if (users.error) throw new Error(users.error.message)
    if (users.data.length == 0) return username
    const userlist = users.data.map((u: { username: string }) => u.username)
    const next = (num: number): string => {
        if (userlist.includes(`${username}${num}`)) return next(num + 1)
        return `${username}${num}`
    }
    return next(1)
}
