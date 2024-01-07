import { z } from '@zod/mod.ts'
import { compare, hash } from '@utils/hash.ts'
import db from '@db/sqlite.ts'
import { UserModel } from '@interfaces/User.ts'
import { generateToken } from '@utils/token.ts'
import { TOKEN_TYPES, tTokenType } from '@constants'
import { ApiRegister, ApiUser } from '@apiTypes'
import { dbRegisters, dbUsers } from '@db/sqlite.types.ts'

export class UserSqliteModel implements UserModel {
    /**
     * @throws {Error} Not found
     */
    get(id: number): Promise<ApiUser> {
        const u = db.sql<dbUsers>`
            select * 
            from users 
            where id = ${id}`
        if (!u.length) throw new Error('Not found')
        return Promise.resolve(u[0])
    }

    /**
     * @param email
     * @param password
     * @returns
     * @throws {Error} Invalid user or password
     */
    async login(
        email: string,
        password: string,
    ): Promise<{ token: string; expires: number; type: tTokenType }> {
        const [req] = db.sql<dbRegisters>`
            select *
            from registers
            where email = ${email}`
        if (!req) throw new Error('Invalid user or password')
        if (!(await compare(password, req.password))) {
            throw new Error('Invalid user or password')
        }
        if (req.user_id) {
            const user = await this.get(req.user_id)
            return generateToken({
                email: req.email,
                id: req.id,
                created_at: req.created_at,
                user,
                type: TOKEN_TYPES.Bearer,
            })
        }
        return generateToken({
            email: req.email,
            id: req.id,
            created_at: req.created_at,
            type: TOKEN_TYPES.Register,
        })
    }

    /**
     * @param email
     * @param password
     * @returns
     * @throws {Error} Email already registered
     */
    async register(email: string, password: string): Promise<ApiRegister> {
        const parsedEmail = z.string().email().safeParse(email)
        if (!parsedEmail.success) throw new Error('Invalid email')
        const [r] = db.sql<dbRegisters>`
            select *
            from registers
            where email = ${email}`
        if (r) throw new Error('Email already registered')
        const [u] = db.sql<dbRegisters>`
            INSERT INTO registers (
                email, 
                password
            ) 
            VALUES (
                ${email},
                ${await hash(password)}
            )
            returning *`
        return {
            id: u.id,
            email: u.email,
            user_id: u.user_id,
            created_at: new Date(u.created_at).getTime(),
        }
    }

    /**
     * @param register_id
     * @param username
     * @returns
     * @throws {Error} Invalid register id
     * @throws {Error} Username already registered
     */
    create(register_id: number, username: string): Promise<ApiUser> {
        const [reg] = db.sql<dbRegisters>`
            select *
            from registers
            where id = ${register_id}`
        if (!reg) throw new Error('Invalid register id')
        const [u] = db.sql<dbUsers>`
            select *
            from users
            where username = ${username}`
        if (u) throw new Error('Username already registered')
        const [user] = db.sql<dbUsers>`
            insert into users (
                username
            )
            values (
                ${username}
            ) returning *`
        db.sql`
            update registers
            set user_id = ${user.id}
            where id = ${register_id}`
        return Promise.resolve(user)
    }

    /**
     * @param id
     * @returns
     * @throws {Error} Register not found
     */
    getRegister(id: number): Promise<ApiRegister & { password: string }> {
        const r = db.sql<dbRegisters>`
            select *
            from registers
            where id = ${id}`
        if (!r.length) throw new Error('Register not found')
        const [reg] = r
        return Promise.resolve({
            ...reg,
            created_at: new Date(reg.created_at).getTime(),
        })
    }

    /**
     * @param param0
     * @returns
     * @throws {Error} Username already registered
     */
    update(
        { username, displayname, id }: { username?: string | undefined; displayname?: string | null; id: number },
    ): Promise<ApiUser> {
        if (username) {
            const [u] = db.sql<dbUsers>`
                select *
                from users
                where username = ${username}`
            if (u) throw new Error('Username already registered')
            db.sql`
                update users
                set username = ${username}
                where id = ${id}`
        }
        if (typeof displayname !== 'undefined') {
            db.sql`
                update users
                set displayname = ${displayname}
                where id = ${id}`
        }
        const [user] = db.sql<dbUsers>`
            select *
            from users
            where id = ${id}`
        return Promise.resolve(user)
    }

    /**
     * @param id
     * @param avatar
     * @returns
     * @throws {Error} User not found
     */
    async setAvatar(id: number, avatar: File): Promise<ApiUser> {
        const old = await this.get(id)
        await Deno.mkdir(Deno.cwd() + `/sql/storage/avatars/olds`, { recursive: true }).catch(() => {})
        if (old.avatar) {
            await Deno.rename(
                Deno.cwd() + `/sql/storage/avatars/${old.avatar}`,
                Deno.cwd() + `/sql/storage/avatars/olds/${old.avatar}`,
            )
        }
        const now = Date.now()
        await Deno.writeFile(Deno.cwd() + `/sql/storage/avatars/${id}-${now}.png`, avatar.stream())
        const [user] = db.sql<dbUsers>`
            update users
            set avatar = ${id + '-' + now + '.png'}
            where id = ${id}
            returning *`
        return user
    }
}
