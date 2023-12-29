import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts'
import { compare, hash } from '../../utils/hash.ts'
import supabase from '../../supabase.ts'
import { iUser, tuser } from './interface.ts'
import { generateToken } from '../../utils/token.ts'

export class User implements iUser {
    get(id: number): Promise<tuser> {
        const u = supabase.from('users').select().eq('id', id)
        if (u.error) throw new Error(JSON.stringify(u))
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
            if (r.error) throw new Error(JSON.stringify(r))
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
