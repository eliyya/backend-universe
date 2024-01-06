import { iGroupModel, tGroup } from '@interfaces/Group.ts'

import supabase from '@db/supabase.ts'

export class GroupModel implements iGroupModel {
    /**
     * @param id
     * @returns
     * @throws {Error} Group not found
     */
    async get(id: number): Promise<tGroup> {
        console.log('get group', id)

        const { data, error } = await supabase
            .from('groups')
            .select()
            .eq('id', id)
        if (error) {
            console.log(error)
            throw error
        } else {
            if (data?.length) {
                return data[0]
            } else throw new Error('Group not found')
        }
    }

    async create(options: { name: string; description?: string | undefined; owner_id: number }): Promise<tGroup> {
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
        return g
    }

    async getAllOfUser(user_id: number): Promise<tGroup[]> {
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
        return [...new Set([...ow.data, ...mem.data])]
    }

    // async addMember(options: { id: number; user_id: number }): Promise<tGroup> {
    //     const old = await this.get(options.id)

    // }
}
