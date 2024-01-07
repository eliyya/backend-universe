import { z } from '@zod/mod.ts'
import { compare, hash } from '@utils/hash.ts'
import supabase from '@db/supabase.ts'
import { UserModel } from '@interfaces/User.ts'
import { generateToken } from '@utils/token.ts'
import { TOKEN_TYPES, TokenType } from '@constants'
import { ApiRegister, ApiUser } from '@apiTypes'
import { AuthError, DataBaseError, SupabaseError } from '@error'

export class UserSupabaseModel implements UserModel {
    /**
     * @description Get user by id
     * @param {number} id User id
     * @returns {Promise<ApiUser>}
     * @throws {SupabaseError}
     * @example await get(1)
     */
    async get(id: number): Promise<ApiUser> {
        const req = await supabase
            .from('users')
            .select()
            .eq('id', id)
        if (req.error) {
            throw new SupabaseError(req.error)
        }
        const [u] = req.data
        return u
    }

    /**
     * @description Register a new user
     * @param {string} email User email
     * @param {string} password User password
     * @returns {Promise<ApiRegister>}
     * @throws {DataBaseError} "email" already exists
     * @throws {DataBaseError} Invalid "email"
     * @throws {SupabaseError}
     * @example await register('user@example.com', 'password')
     */
    async register(email: string, password: string): Promise<ApiRegister> {
        const parsedEmail = z.string().email().safeParse(email)
        if (!parsedEmail.success) throw DataBaseError.Invalid('"email"')
        const req = await supabase
            .from('registers')
            .select()
            .eq('email', email)
        if (req.error) {
            throw new SupabaseError(req.error)
        }
        if (req.data?.length) throw DataBaseError.Duplicate('"email"')
        const r = await supabase
            .from('registers')
            .insert({ email, password: await hash(password) })
            .select()
        if (r.error) {
            throw new SupabaseError(r.error)
        }
        return {
            ...r.data[0],
            created_at: new Date(r.data[0].created_at).getTime(),
        }
    }

    /**
     * @description Login user and return token
     * @param {string} email User email
     * @param {string} password User password hashed
     * @returns {Promise<tUserToken>} token, type and expires
     * @throws {AuthError} Invalid email
     * @throws {AuthError} Invalid password
     * @throws {SupabaseError}
     * @example await login('user@example.com', await hash('password'))
     */
    async login(
        email: string,
        password: string,
    ): Promise<{ token: string; expires: number; type: TokenType }> {
        const req = await supabase
            .from('registers')
            .select()
            .eq('email', email)
        if (req.error) {
            throw new SupabaseError(req.error)
        }
        if (!req.data?.length) throw AuthError.Invalid('email')
        const [u] = req.data
        if (!(await compare(password, u.password))) throw AuthError.Invalid('password')
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
     * @description Create a new user
     * @param {number} register_id Register id
     * @param {string} username User username
     * @returns {Promise<ApiUser>}
     * @throws {DataBaseError} Register not found
     * @throws {DataBaseError} "username" already exists
     * @throws {SupabaseError}
     * @example await create(1, 'username')
     */
    async create(register_id: number, username: string): Promise<ApiUser> {
        const req = await supabase
            .from('registers')
            .select()
            .eq('id', register_id)
        if (req.error) {
            throw new SupabaseError(req.error)
        }
        if (!req.data?.length) throw DataBaseError.NotFound()
        const req2 = await supabase
            .from('users')
            .select()
            .eq('username', username)
        if (req2.error) {
            throw new SupabaseError(req2.error)
        }
        if (req2.data?.length) throw DataBaseError.Duplicate('"username""')
        const u = await supabase
            .from('users')
            .insert({ username })
            .select()
        if (u.error) {
            throw new SupabaseError(u.error)
        }
        const [user] = u.data
        const r = await supabase
            .from('registers')
            .update({ user_id: user.id })
            .eq('id', register_id)
            .select()
        if (r.error) {
            throw new SupabaseError(r.error)
        }
        return user
    }

    /**
     * @description Get register by id
     * @param {number} id Register id
     * @returns {Promise<ApiRegister & { password: string }>} Register with password
     * @throws {DataBaseError} Register not found
     * @throws {SupabaseError}
     * @example await getRegister(1)
     */
    async getRegister(id: number): Promise<ApiRegister & { password: string }> {
        const r = await supabase
            .from('registers')
            .select()
            .eq('id', id)
        if (r.error) {
            throw new SupabaseError(r.error)
        }
        if (!r.data?.length) throw DataBaseError.NotFound()
        const [reg] = r.data
        return {
            ...reg,
            created_at: new Date(reg.created_at).getTime(),
        }
    }

    /**
     * @description Update user
     * @param {{id:string,displayname?:string|null,username?:string}} param0 User data to update
     * @returns {Promise<ApiUser>} Updated user
     * @throws {DataBaseError} Username already exists
     * @throws {SupabaseError}
     * @example await update({ id: 1, username: 'username' })
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
            if (u.error.message.includes('value violates unique constraint')) {
                throw DataBaseError.Duplicate('"username"')
            }
            throw new SupabaseError(u.error)
        }
        const [user] = u.data
        return user
    }

    /**
     * @description Set user avatar
     * @param {number} id User id
     * @param {File} avatar User avatar
     * @returns {Promise<ApiUser>} Updated user
     * @throws {SupabaseError}
     * @throws {StorageError}
     * @example await setAvatar(1, pngAvatar)
     */
    async setAvatar(id: number, avatar: File): Promise<ApiUser> {
        const o = await supabase
            .from('users')
            .select()
            .eq('id', id)
        if (o.error) {
            throw new SupabaseError(o.error)
        }
        const [old] = o.data
        if (old.avatar) {
            const d = await supabase
                .storage
                .from('avatars')
                .move(old.avatar, `olds/${old.avatar}.png`)
            if (d.error) {
                throw d.error
            }
        }
        const a = await supabase
            .storage
            .from('avatars')
            .upload(`${id}-${Date.now()}.png`, avatar)
        if (a.error) {
            throw a.error
        }
        const u = await supabase
            .from('users')
            .update({ avatar: a.data.path })
            .eq('id', id)
            .select()
        if (u.error) {
            throw new SupabaseError(u.error)
        }
        const [user] = u.data
        return user
    }
}
