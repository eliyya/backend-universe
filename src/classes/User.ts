import { userController } from '@controller'
import { tUser } from '@interfaces/User.ts'
import { Register } from '@classes/Register.ts'

export class User {
    readonly id: number
    #username: string
    #avatar: string | null = null
    #displayname: string | null = null

    get username() {
        return this.#username
    }

    get displayname() {
        return this.#displayname
    }

    get avatar() {
        return this.#avatar
    }

    constructor(
        { id, username, avatar, displayname }: tUser,
    ) {
        this.id = id
        this.#username = username
        this.#avatar = avatar ?? null
        this.#displayname = displayname ?? null
    }

    static async get(id: number): Promise<User> {
        const u = await userController.get(id)
        return new User(u)
    }

    /**
     * @throws {Error} Email already registered
     */
    static async register(email: string, password: string): Promise<Register> {
        const u = await Register.register({ email, password })
        return u
    }

    static async create(register_id: number, username: string): Promise<User> {
        return new User(await userController.create(register_id, username))
    }

    /**
     * @throws {Error} Username already registered
     */
    async update(
        { username, displayname }: { username?: string; displayname?: string | null },
    ): Promise<User> {
        try {
            const n = await userController.update({ username, displayname, id: this.id })
            this.#username = n.username
            this.#displayname = n.displayname
            return this
        } catch (error) {
            if (error.message === 'Username already registered') {
                throw new Error(error.message)
            }
            console.error(error)
            throw new Error('Error updating user', { cause: error })
        }
    }

    async setAvatar(avatar: File): Promise<User> {
        const n = await userController.setAvatar(this.id, avatar)
        if (n.avatar) this.#avatar = n.avatar
        return this
    }

    toJSON() {
        return {
            id: this.id,
            username: this.#username,
            avatar: this.#avatar,
            displayname: this.#displayname,
        }
    }
}
