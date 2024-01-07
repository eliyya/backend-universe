import { iGroupModel } from '@interfaces/Group.ts'

import supabase from '@db/supabase.ts'
import { ApiGroup } from '@apiTypes'

export class GroupModel implements iGroupModel {
    /**
     * @param id
     * @returns
     * @throws {Error} Group not found
     */
    async get(id: number): Promise<ApiGroup> {
        const { data, error } = await supabase
            .from('groups')
            .select()
            .eq('id', id)
        if (error) {
            console.error(error)
            throw error
        } else {
            if (data?.length) {
                return {
                    ...data[0],
                    created_at: new Date(data[0].created_at).getTime(),
                }
            } else throw new Error('Group not found')
        }
    }

    async create(options: { name: string; description?: string | undefined; owner_id: number }): Promise<ApiGroup> {
        const req = await supabase
            .from('groups')
            .insert({
                name: options.name,
                description: options.description ?? null,
                owner_id: options.owner_id,
                member_ids: [],
            })
            .select()
        if (req.error) {
            console.error(req.error)
            throw req.error
        }
        const [g] = req.data
        return {
            ...g,
            created_at: new Date(g.created_at).getTime(),
        }
    }

    async getAllOfUser(user_id: number): Promise<ApiGroup[]> {
        const ow = await supabase
            .from('groups')
            .select()
            .eq('owner_id', user_id)
        if (ow.error) {
            console.error(ow.error)
            throw ow.error
        }
        const mem = await supabase
            .from('groups')
            .select()
            .contains('member_ids', [user_id])
        if (mem.error) {
            console.error(mem.error)
            throw mem.error
        }
        return [
            ...new Set([
                ...ow.data.map((e) => ({ ...e, created_at: new Date(e.created_at).getTime() })),
                ...mem.data.map((e) => ({ ...e, created_at: new Date(e.created_at).getTime() })),
            ]),
        ]
    }

    /**
     * @param options
     * @returns
     * @throws {Error} User is already owner
     * @throws {Error} Group not found
     * @throws {Error} User is already member
     */
    async addMember(options: { id: number; user_id: number }): Promise<ApiGroup> {
        const old = await this.get(options.id)
        if (old.owner_id === options.user_id) throw new Error('User is already owner')
        if (old.member_ids.includes(options.user_id)) throw new Error('User is already member')
        const req = await supabase
            .from('groups')
            .update({
                member_ids: [...old.member_ids, options.user_id],
            })
            .eq('id', options.id)
            .select()
        if (req.error) {
            console.error(req.error)
            throw req.error
        }
        const [g] = req.data
        return {
            ...g,
            created_at: new Date(g.created_at).getTime(),
        }
    }

    /**
     * @param options
     * @returns
     * @throws {Error} User is already owner
     * @throws {Error} Group not found
     */
    async removeMember(options: { id: number; user_id: number }): Promise<ApiGroup> {
        const old = await this.get(options.id)
        if (old.owner_id === options.user_id) throw new Error('User is already owner')
        if (!old.member_ids.includes(options.user_id)) return old
        const req = await supabase
            .from('groups')
            .update({
                member_ids: old.member_ids.filter((id) => id !== options.user_id),
            })
            .eq('id', options.id)
            .select()
        if (req.error) {
            console.error(req.error)
            throw req.error
        }
        const [g] = req.data
        return {
            ...g,
            created_at: new Date(g.created_at).getTime(),
        }
    }

    /**
     * @param {number} id
     * @returns
     */
    async delete(id: number): Promise<void> {
        const req = await supabase
            .from('groups')
            .delete()
            .eq('id', id)
            .select()
        if (req.error) {
            console.error(req.error)
            throw req.error
        }
    }

    /**
     * @param
     * @returns
     */
    async update(options: { id: number; name?: string; description?: string | null }): Promise<ApiGroup> {
        const req = await supabase
            .from('groups')
            .update({
                name: options.name,
                description: options.description,
            })
            .eq('id', options.id)
            .select()
        if (req.error) {
            console.error(req.error)
            throw req.error
        }
        const [g] = req.data
        return {
            ...g,
            created_at: new Date(g.created_at).getTime(),
        }
    }
}
