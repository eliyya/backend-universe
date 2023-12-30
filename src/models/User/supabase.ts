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
                id: u.id,
                created_at: u.created_at,
                user,
            })
        }
        return generateToken({
            email: u.email,
            id: u.id,
            created_at: u.created_at,
        })
    }

    async create(register_id: string, username: string): Promise<tUser> {
        const req = await supabase.from('registers').select().eq(
            'id',
            register_id,
        )
        if (req.error) {
            console.error(req.error)
            Sentry.captureException(req.error)
            throw new Error(req.error.message)
        }
        if (!req.data?.length) throw new Error('Invalid register id')
        const req2 = await supabase.from('users').select().eq(
            'username',
            username,
        )
        if (req2.error) {
            console.error(req2.error)
            Sentry.captureException(req2.error)
            throw new Error(req2.error.message)
        }
        if (req2.data?.length) throw new Error('Username already registered')
        const u = await supabase.from('users').insert({
            username,
        }).select()
        if (u.error) {
            console.error(u.error)
            Sentry.captureException(u.error)
            throw new Error(u.error.message)
        }
        const [user] = u.data
        const r = await supabase.from('registers').update({
            user_id: user.id,
        }).eq('id', register_id).select()
        if (r.error) {
            console.error(r.error)
            Sentry.captureException(r.error)
            throw new Error(r.error.message)
        }
        return user
    }
}
