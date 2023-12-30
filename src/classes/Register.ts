import { userController } from '@controller'
import { tRegister, tUser } from '@interfaces/User.ts'
import { User } from '@classes/User.ts'

export class Register {
    id: number
    email: string
    created_at: Date
    user_id: number | null = null
    user: User | null = null

    constructor(
        { created_at, email, id, user_id, user }:
            & Omit<tRegister, 'user_id' | 'password'>
            & {
                user_id?: number | null
                user?: tUser | null | User
            },
    ) {
        this.id = id
        this.email = email
        this.created_at = new Date(created_at)
        this.user_id = user_id ?? null
        if (user) {
            if (user instanceof User) {
                this.user = user
            } else {
                this.user = new User(user)
            }
        }
    }
    static async register(
        { email, password, username }: {
            email: string
            password: string
            username?: string
        },
    ): Promise<Register> {
        const reg = await userController.register(email, password)
        if (username) {
            const u = await userController.create(reg.id, username)
            return new Register({ ...reg, user: u })
        }
        return new Register(reg)
    }
}
