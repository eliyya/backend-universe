import { Database } from '../database.types.ts'

export type tUser = Omit<
    Database['public']['Tables']['users']['Row'],
    'password'
>

export interface iUser {
    get(id: number): Promise<tUser>
    register(email: string, password: string): Promise<tUser>
    login(
        email: string,
        password: string,
    ): Promise<{ token: string; expires: number }>
}
