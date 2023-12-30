import { Database } from '../database.types.ts'

export type tUser = Database['public']['Tables']['users']['Row']
export type tRegister = Database['public']['Tables']['registers']['Row']

export interface iUser {
    get(id: number): Promise<tUser>
    register(email: string, password: string): Promise<tRegister>
    login(
        email: string,
        password: string,
    ): Promise<{ token: string; expires: number }>
    create(register_id: string, username: string): Promise<tUser>
}
