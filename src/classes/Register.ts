import { userController } from '@controller'
import { tRegister, tUser } from '@interfaces/User.ts'

export class Register {
    id: number
    email: string
    password: string
    created_at: Date
    user_id: number | null = null
    user: tUser | null = null

    constructor(
        { created_at, email, id, password, user_id, user }:
            & Omit<tRegister, 'user_id'>
            & {
                user_id?: number | null
                user?: tUser | null
            },
    ) {
        this.id = id
        this.email = email
        this.password = password
        this.created_at = new Date(created_at)
        this.user_id = user_id ?? null
        this.user = user ?? null
    }
    static async register(
        { email, password, username }: {
            email: string
            password: string
            username?: string
        },
    ): Promise<Register> {
        const reg = await userController.register(email, password)
        return new Register(reg)
    }
}
