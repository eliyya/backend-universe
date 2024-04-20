import { z } from '@zod/mod.ts'
import { compare, hash } from '@utils/hash.ts'
import { db } from '@db'
import { generateToken } from '@utils/token.ts'
import { TOKEN_TYPES, TokenType } from '@constants'
import { ApiRegister, ApiUser } from '@apiTypes'
import { AuthError, DataBaseError, InvalidTypeError, NotFoundError, SupabaseError } from '@error'
import { generateId } from '@utils/snowflake.ts'

export class UserModel {
    /**
     * @description Get user by id
     * @param {string} id User id
     * @returns {Promise<ApiUser>}
     * @throws {DataBaseError} User not found
     * @throws {SupabaseError}
     * @example await get(1)
     */
    async get(id: string): Promise<ApiUser> {
        const user = await db
            .from('user')
            .select()
            .eq('id', id)
            .single()
        if (user.error) {
            if (user.error.details === 'The result contains 0 rows') {
                throw new NotFoundError('User')
            }
            throw new SupabaseError(user.error)
        }
        return user.data
    }

    /**
     * @description Register a new user
     * @param {string} email User email
     * @param {string} password User password
     * @returns {Promise<ApiRegister>}
     * @throws {DuplicateError} email already exists
     * @throws {InvalidTypeError} email type is invalid
     * @throws {SupabaseError}
     * @example await register('user@example.com', 'password')
     */
    async register(email: string, password: string): Promise<ApiRegister> {
        const parsedEmail = z.string().email().safeParse(email)
        if (!parsedEmail.success) throw new InvalidTypeError('email', parsedEmail.error)
        const r = await db
            .from('registers')
            .insert({ 
                id: generateId(),
                email, 
                password: await hash(password) 
            })
            .select()
            .single()
        if (r.error) {
            throw new SupabaseError(r.error)
        }
        return {
            ...r.data,
            created_at: new Date(r.data.created_at).getTime(),
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
        const req = await db
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
     * @param {string} register_id Register id
     * @param {string} username User username
     * @returns {Promise<ApiUser>}
     * @throws {DataBaseError} Register not found
     * @throws {DataBaseError} "username" already exists
     * @throws {SupabaseError}
     * @example await create(1, 'username')
     */
    async create(register_id: string, username: string): Promise<ApiUser> {
        const req = await db
            .from('registers')
            .select()
            .eq('id', register_id)
        if (req.error) {
            throw new SupabaseError(req.error)
        }
        if (!req.data?.length) throw new NotFoundError()
        const req2 = await db
            .from('users')
            .select()
            .eq('username', username)
        if (req2.error) {
            throw new SupabaseError(req2.error)
        }
        if (req2.data?.length) throw DataBaseError.Duplicate('"username""')
        const u = await db
            .from('users')
            .insert({ 
                id: generateId(),
                username
             })
            .select()
        if (u.error) {
            throw new SupabaseError(u.error)
        }
        const [user] = u.data
        const r = await db
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
     * @param {string} id Register id
     * @returns {Promise<ApiRegister & { password: string }>} Register with password
     * @throws {DataBaseError} Register not found
     * @throws {SupabaseError}
     * @example await getRegister(1)
     */
    async getRegister(id: string): Promise<ApiRegister & { password: string }> {
        const r = await db
            .from('registers')
            .select()
            .eq('id', id)
        if (r.error) {
            throw new SupabaseError(r.error)
        }
        if (!r.data?.length) throw new NotFoundError()
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
        { id, displayname, username }: { username?: string; displayname?: string | null; id: string },
    ): Promise<ApiUser> {
        const u = await db
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
}
