import { z } from '@zod/mod.ts'
import { compare, hash } from '@utils/hash.ts'
import supabase from '@db/supabase.ts'
import { UserModel } from '@interfaces/User.ts'
import { generateToken } from '@utils/token.ts'
import { TOKEN_TYPES, tTokenType } from '@constants'
import { ApiRegister, ApiUser } from '@apiTypes'

export class UserSupabaseModel implements UserModel {
    async get(id: number): Promise<ApiUser> {
        const req = await supabase
            .from('users')
            .select()
            .eq('id', id)
        if (req.error) {
            console.error(req.error)
            throw new Error(req.error.message)
        }
        const [u] = req.data
        return u
    }

    /**
     * @throws {Error} Email already registered
     * @throws {Error} Invalid email
     */
    async register(email: string, password: string): Promise<ApiRegister> {
        const parsedEmail = z.string().email().safeParse(email)
        if (!parsedEmail.success) throw new Error('Invalid email')
        const req = await supabase
            .from('registers')
            .select()
            .eq('email', email)
        if (req.error) {
            console.error(req.error)
            throw new Error(req.error.message)
        }
        if (req.data?.length) throw new Error('Email already registered')
        const r = await supabase
            .from('registers')
            .insert({ email, password: await hash(password) })
            .select()
        if (r.error) {
            console.error(r.error)
            throw new Error(r.error.message)
        }
        return {
            ...r.data[0],
            created_at: new Date(r.data[0].created_at).getTime(),
        }
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

    /**
     * @param register_id
     * @param username
     * @returns
     * @throws {Error} Invalid register id
     * @throws {Error} Username already registered
     */
    async create(register_id: number, username: string): Promise<ApiUser> {
        const req = await supabase
            .from('registers')
            .select()
            .eq('id', register_id)
        if (req.error) {
            console.error(req.error)
            throw new Error(req.error.message)
        }
        if (!req.data?.length) throw new Error('Invalid register id')
        const req2 = await supabase
            .from('users')
            .select()
            .eq('username', username)
        if (req2.error) {
            console.error(req2.error)
            throw new Error(req2.error.message)
        }
        if (req2.data?.length) throw new Error('Username already registered')
        const u = await supabase
            .from('users')
            .insert({ username })
            .select()
        if (u.error) {
            console.error(u.error)
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
            throw new Error(r.error.message)
        }
        return user
    }

    /**
     * @throws {Error} Register not found
     */
    async getRegister(id: number): Promise<ApiRegister & { password: string }> {
        const r = await supabase
            .from('registers')
            .select()
            .eq('id', id)
        if (r.error) {
            console.error(r.error)
            throw new Error(r.error.message)
        }
        if (!r.data?.length) throw new Error('Register not found')
        const [reg] = r.data
        return {
            ...reg,
            created_at: new Date(reg.created_at).getTime(),
        }
    }

    /**
     * @throws {Error} Username already registered
     */
    async update(
        { id, displayname, username }: { username?: string; displayname?: string | null; id: number },
    ): Promise<ApiUser> {
        const u = await supabase
            .from('users')
            .update({ displayname, username })
            .eq('id', id)
            .select()
        if (u.error) {
            if (u.error.message.includes('duplicate key value violates unique constraint')) {
                throw new Error('Username already registered')
            }
            throw new Error(u.error.message)
        }
        const [user] = u.data
        return user
    }

    async setAvatar(id: number, avatar: File): Promise<ApiUser> {
        const o = await supabase
            .from('users')
            .select()
            .eq('id', id)
        if (o.error) {
            console.error(o.error)
            throw new Error(o.error.message)
        }
        const [old] = o.data
        if (old.avatar) {
            const d = await supabase
                .storage
                .from('avatars')
                .move(old.avatar, `olds/${old.avatar}.png`)
            if (d.error) {
                console.error(d.error)
                throw new Error(d.error.message)
            }
        }
        const a = await supabase
            .storage
            .from('avatars')
            .upload(`${id}-${Date.now()}.png`, avatar)
        if (a.error) {
            console.error(a.error)
            throw new Error(a.error.message)
        }
        const u = await supabase
            .from('users')
            .update({ avatar: a.data.path })
            .eq('id', id)
            .select()
        if (u.error) {
            console.error(u.error)
            throw new Error(u.error.message)
        }
        const [user] = u.data
        return user
    }
}
