

import { db } from '@db'
import { ApiGroup, ApiUser } from '@apiTypes'
import { generateId } from '@utils/snowflake.ts'

export class GroupModel {
    /**
     * @param {string} id
     * @returns {Promise<ApiGroup>}
     * @throws {Error} Group not found
     */
    async get(id: string): Promise<ApiGroup> {
        const { data, error } = await db
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

    /**
     * @param {{ name: string; description?: string | undefined; owner_id: string }} options
     * @returns {Promise<ApiGroup>}
     * @throws {Error} Group not found
     */
    async create(options: { name: string; description?: string | undefined; owner_id: string }): Promise<ApiGroup> {
        const req = await db
            .from('groups')
            .insert({
                id: generateId(),
                name: options.name,
                description: options.description ?? null,
                owner_id: options.owner_id,
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
        const ow = await db
            .from('groups')
            .select()
            .eq('owner_id', user_id)
        if (ow.error) {
            console.error(ow.error)
            throw ow.error
        }
        const mem = await db
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
     * @param {{ id: string; user_id: string }} options
     * @returns {Promise<void>}
     * @throws {Error} User is already owner
     * @throws {Error} Group not found
     * @throws {Error} User is already member
     */
    async addMember(options: { id: string; user_id: string }): Promise<void> {
        await db
            .from('groups_users')
            .insert({
                group_id: options.id,
                user_id: options.user_id,
            })
    }

    /**
     * @param {{ id: string; user_id: string }} options
     * @returns {Promise<void>}
     * @throws {Error} User is already owner
     * @throws {Error} Group not found
     */
    async removeMember(options: { id: string; user_id: string }): Promise<void> {
        await db
            .from('groups_users')
            .delete()
            .eq('group_id', options.id)
            .eq('user_id', options.user_id)
    }

    /**
     * @param {string} id
     * @returns {Promise<void>}
     */
    async delete(id: string): Promise<void> {
        const req = await db
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
     * @param {{ id: string; name?: string; description?: string | null }} options
     * @returns {Promise<ApiGroup>}
     */
    async update(options: { id: string; name?: string; description?: string | null }): Promise<ApiGroup> {
        const req = await db
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

    async isMember(group_id: string, user_id: string): Promise<boolean> {
        const { data, error } = await db
            .from('groups_users')
            .select()
            .eq('group_id', group_id)
            .eq('user_id', user_id)
        if (error) {
            console.error(error)
            throw error
        } else {
            return !!data?.length
        }    
    }

    async isOwner(group_id: string, user_id: string): Promise<boolean> {
        const { data, error } = await db
            .from('groups')
            .select()
            .eq('id', group_id)
            .eq('owner_id', user_id)
        if (error) {
            console.error(error)
            throw error
        } else {
            return !!data?.length
        }
    }

    async getMembers(group_id: string): Promise<ApiUser[]> {
        const { data, error } = await db
            .from('groups_users')
            .select('users (*)')
            .eq('group_id', group_id)
        if (error) {
            console.error(error)
            throw error
        } else {
            return data.filter(e => e.users).map((e) => ({
                ...e.users,
            })) as ApiUser[]
        }
    }
}
