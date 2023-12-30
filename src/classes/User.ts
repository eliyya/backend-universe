import { userController } from '@controller'
import { tUser } from '@interfaces/User.ts'

export class User {
    readonly id: number
    readonly email: string
    readonly username: string
    readonly created_at: Date
    readonly avatar: string | null = null
    readonly displayname: string | null = null

    constructor(
        { id, email, username, created_at, avatar, displayname }: tUser,
    ) {
        this.id = id
        this.email = email
        this.username = username
        this.created_at = new Date(created_at)
        this.avatar = avatar ?? null
        this.displayname = displayname ?? null
    }

    static async get(id: number): Promise<User> {
        const u = await userController.get(id)
        return new User(u)
    }

    static async register(email: string, password: string): Promise<User> {
        const u = await userController.register(email, password)
        return new User(u)
    }

    toJSON() {
        return {
            id: this.id,
            email: this.email,
            username: this.username,
            created_at: this.created_at,
            avatar: this.avatar,
            displayname: this.displayname,
        }
    }
}
