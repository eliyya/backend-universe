import { z } from '@zod/mod.ts'
import { compare, hash } from '@utils/hash.ts'
import supabase from '@db/supabase.ts'
import { iUserModel, tRegister, tUser } from '@interfaces/User.ts'
import { generateToken } from '@utils/token.ts'
import { Sentry } from '@error'
import { TOKEN_TYPES, tTokenType } from '@constants'

export class UserModel implements iUserModel {
    async get(id: number): Promise<tUser> {
        const req = await supabase
            .from('users')
            .select()
            .eq('id', id)
        if (req.error) {
            console.error(req.error)
            Sentry.captureException(req.error)
            throw new Error(req.error.message)
        }
        const [u] = req.data
        return u
    }

    /**
     * @throws {Error} Email already registered
     */
    async register(email: string, password: string): Promise<tRegister> {
        const parsedEmail = z.string().email().safeParse(email)
        if (!parsedEmail.success) throw new Error('Invalid email')
        const req = await supabase
            .from('registers')
            .select()
            .eq('email', email)
        if (req.error) {
            console.error(req.error)
            Sentry.captureException(req.error)
            throw new Error(req.error.message)
        }
        if (req.data?.length) throw new Error('Email already registered')
        const r = await supabase
            .from('registers')
            .insert({ email, password: await hash(password) })
            .select()
        if (r.error) {
            console.error(r.error)
            Sentry.captureException(r.error)
            throw new Error(r.error.message)
        }
        return r.data[0]
    }

    /**
     * @param {string} email User email
     * @param {string} password User password
     * @returns {Promise<tUserToken>} Token and expires
     * @throws {Error} Invalid user or password
     */
    async login(
        email: string,
        password: string,
    ): Promise<{ token: string; expires: number; type: tTokenType }> {
        const req = await supabase
            .from('registers')
            .select()
            .eq('email', email)
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
                type: TOKEN_TYPES.Bearer,
            })
        }
        return generateToken({
            email: u.email,
            id: u.id,
            created_at: u.created_at,
            type: TOKEN_TYPES.Register,
        })
    }

    async create(register_id: number, username: string): Promise<tUser> {
        console.log(register_id)

        const req = await supabase
            .from('registers')
            .select()
            .eq('id', register_id)
        if (req.error) {
            console.error(req.error)
            Sentry.captureException(req.error)
            throw new Error(req.error.message)
        }
        if (!req.data?.length) throw new Error('Invalid register id')
        const req2 = await supabase
            .from('users')
            .select()
            .eq('username', username)
        if (req2.error) {
            console.error(req2.error)
            Sentry.captureException(req2.error)
            throw new Error(req2.error.message)
        }
        if (req2.data?.length) throw new Error('Username already registered')
        const u = await supabase
            .from('users')
            .insert({ username })
            .select()
        if (u.error) {
            console.error(u.error)
            Sentry.captureException(u.error)
            throw new Error(u.error.message)
        }
        const [user] = u.data
        const r = await supabase
            .from('registers')
            .update({ user_id: user.id })
            .eq('id', register_id)
            .select()
        if (r.error) {
            console.error(r.error)
            Sentry.captureException(r.error)
            throw new Error(r.error.message)
        }
        return user
    }

    /**
     * @throws {Error} Register not found
     */
    async getRegister(id: number): Promise<tRegister> {
        const r = await supabase
            .from('registers')
            .select()
            .eq('id', id)
        if (r.error) {
            console.error(r.error)
            Sentry.captureException(r.error)
            throw new Error(r.error.message)
        }
        if (!r.data?.length) throw new Error('Register not found')
        const [reg] = r.data
        return reg
    }

    async update(
        { id, displayname, username }: { username?: string; displayname?: string | null; id: number },
    ): Promise<tUser> {
        const u = await supabase
            .from('users')
            .update({ displayname, username })
            .eq('id', id)
            .select()
        if (u.error) {
            console.error(u.error)
            Sentry.captureException(u.error)
            throw new Error(u.error.message)
        }
        const [user] = u.data
        return user
    }

    async setAvatar(id: number, avatar: File): Promise<tUser> {
        const o = await supabase
            .from('users')
            .select()
            .eq('id', id)
        if (o.error) {
            console.error(o.error)
            Sentry.captureException(o.error)
            throw new Error(o.error.message)
        }
        const [old] = o.data
        console.log('old', old)

        if (old.avatar) {
            const d = await supabase
                .storage
                .from('avatars')
                .move(old.avatar, `olds/${old.avatar}.png`)
            if (d.error) {
                console.error(d.error)
                Sentry.captureException(d.error)
                throw new Error(d.error.message)
            }
        }
        const a = await supabase
            .storage
            .from('avatars')
            .upload(`${id}-${Date.now()}.png`, avatar)
        if (a.error) {
            console.error(a.error)
            Sentry.captureException(a.error)
            throw new Error(a.error.message)
        }
        const u = await supabase
            .from('users')
            .update({ avatar: a.data.path })
            .eq('id', id)
            .select()
        console.log(a.data.path)
        if (u.error) {
            console.error(u.error)
            Sentry.captureException(u.error)
            throw new Error(u.error.message)
        }
        const [user] = u.data
        return user
    }
}
