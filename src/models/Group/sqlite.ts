import { iGroupModel, tGroup } from '@interfaces/Group.ts'
import db from '@db/sqlite.ts'

export class GroupModel implements iGroupModel {
    get(id: number): Promise<tGroup> {
        const [g] = db.sql<tGroup>`
            select 
                groups.*, 
                json_group_array(group_members.user_id) 
                    as member_ids
            from groups
            left join group_members
            on groups.id = group_members.group_id
            where groups.id = ${id}`
        return Promise.resolve(g)
    }

    create(options: { name: string; description?: string; owner_id: number }): Promise<tGroup> {
        const [g] = db.sql<tGroup>`
            insert into groups (
                name, 
                description, 
                owner_id,
            )
            values (
                ${options.name},
                ${options.description ?? null},
                ${options.owner_id},
            ) returning *`
        g.member_ids = []
        return Promise.resolve(g)
    }

    update(options: { id: number; name?: string; description?: string | null }): Promise<tGroup> {
        if (options.name) {
            db.sql`
                update groups
                set name = ${options.name}
                where id = ${options.id}`
        }
        if (options.description) {
            db.sql`
                update groups
                set description = ${options.description}
                where id = ${options.id}`
        }
        return this.get(options.id)
    }

    delete(id: number): Promise<void> {
        db.sql`
            delete from groups
            where id = ${id}`
        return Promise.resolve()
    }

    addMember(options: { id: number; user_id: number }): Promise<tGroup> {
        db.sql`
            insert into group_members (
                group_id,
                user_id,
            )
            values (
                ${options.id},
                ${options.user_id},
            )`
        return this.get(options.id)
    }

    removeMember(options: { id: number; user_id: number }): Promise<tGroup> {
        db.sql`
            delete from group_members
            where group_id = ${options.id}
            and user_id = ${options.user_id}`
        return this.get(options.id)
    }
}
