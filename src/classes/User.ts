import { userController } from '@controller'
import { tUser } from '@interfaces/User.ts'
import { Register } from '@classes/Register.ts'

export class User {
    readonly id: number
    readonly username: string
    readonly avatar: string | null = null
    readonly displayname: string | null = null

    constructor(
        { id, username, avatar, displayname }: tUser,
    ) {
        this.id = id
        this.username = username
        this.avatar = avatar ?? null
        this.displayname = displayname ?? null
    }

    static async get(id: number): Promise<User> {
        const u = await userController.get(id)
        return new User(u)
    }

    static async register(email: string, password: string): Promise<Register> {
        const u = await Register.register({ email, password })
        return u
    }

    static async create(register_id: number, username: string): Promise<User> {
        return new User(await userController.create(register_id, username))
    }

    toJSON() {
        return {
            id: this.id,
            username: this.username,
            avatar: this.avatar,
            displayname: this.displayname,
        }
    }
}
