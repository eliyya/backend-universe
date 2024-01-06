import { Database } from '../database.types.ts'

export type tGroup = Database['public']['Tables']['groups']['Row']

export interface iGroupModel {
    get(id: number): Promise<tGroup>
    create(options: { name: string; description?: string; owner_id: number }): Promise<tGroup>
    update(options: { id: number; name?: string; description?: string | null }): Promise<tGroup>
    delete(id: number): Promise<void>
    addMember(options: { id: number; user_id: number }): Promise<tGroup>
    removeMember(options: { id: number; user_id: number }): Promise<tGroup>
}
