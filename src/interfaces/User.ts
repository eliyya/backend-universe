import { TokenType } from '@constants'
import { ApiRegister, ApiUser } from '@apiTypes'

export type tUserToken = {
    email: string
    id: string
    created_at: string
    user?: ApiUser
    type: TokenType
}

export interface UserModel {
    get(id: number): Promise<ApiUser>
    register(email: string, password: string): Promise<ApiRegister>
    login(
        email: string,
        password: string,
    ): Promise<{ token: string; expires: number; type: TokenType }>
    create(register_id: number, username: string): Promise<ApiUser>
    getRegister(id: number): Promise<ApiRegister & { password: string }>
    update(options: { username?: string; displayname?: string | null }): Promise<ApiUser>
    setAvatar(id: number, avatar: File): Promise<ApiUser>
}
