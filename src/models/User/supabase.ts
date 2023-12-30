import { z } from '@zod/mod.ts'
import { compare, hash } from '@utils/hash.ts'
import supabase from '@db/supabase.ts'
import { iUser, tRegister, tUser } from '@interfaces/User.ts'
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

    async register(email: string, password: string): Promise<tRegister> {
        const parsedEmail = z.string().email().safeParse(email)
        if (!parsedEmail.success) throw new Error('Invalid email')
        try {
            const req = await supabase.from('registers').select().eq(
                'email',
                email,
            )
            if (req.error) {
                console.error(req.error)
                Sentry.captureException(req.error)
                throw new Error(req.error.message)
            }
            if (req.data?.length) throw new Error('Email already registered')
            const r = await supabase.from('registers').insert({
                email,
                password: await hash(password),
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
        const req = await supabase.from('registers').select().eq('email', email)
        if (req.error) {
            console.error(req.error)
            Sentry.captureException(req.error)
            throw new Error(req.error.message)
        }
        if (!req.data?.length) throw new Error('Invalid user or password')
        const [u] = req.data
        if (!(await compare(password, u.password))) {
            throw new Error('Invalid user or password')
        }
        if (u.user_id) {
            const user = await this.get(u.user_id)
            return generateToken({
                email: u.email,
                register_id: u.id,
                created_at: u.created_at,
                user,
            })
        }
        return generateToken({
            email: u.email,
            register_id: u.id,
            created_at: u.created_at,
        })
    }
}
