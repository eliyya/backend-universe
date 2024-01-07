import { ApiGroup } from '@apiTypes'
export interface GroupModel {
    get(id: number): Promise<ApiGroup>
    create(options: { name: string; description?: string; owner_id: number }): Promise<ApiGroup>
    update(options: { id: number; name?: string; description?: string | null }): Promise<ApiGroup>
    delete(id: number): Promise<void>
    addMember(options: { id: number; user_id: number }): Promise<ApiGroup>
    removeMember(options: { id: number; user_id: number }): Promise<ApiGroup>
    getAllOfUser(user_id: number): Promise<ApiGroup[]>
}
