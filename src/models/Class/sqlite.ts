import db from '@db/sqlite.ts'
import { ClassModel } from '@interfaces/Class.ts'
import { ApiClass } from '@apiTypes'
import { dbClasses } from '@db/sqlite.types.ts'

export class ClassSqliteModel implements ClassModel {
    async create(
        options:
            & Omit<Partial<ApiClass>, 'id' | 'created_at'>
            & Pick<ApiClass, 'name' | 'teacher_id' | 'subject'>,
    ): Promise<ApiClass> {
        db.sql`
            insert into classes (
                name, 
                teacher_id, 
                subject,
                icon,
                description,
            )
            values (
                ${options.name},
                ${options.teacher_id},
                ${options.subject},
                ${options.icon ?? null},
                ${options.description ?? null},
            )`
        const classId = db.lastInsertRowId
        const { member_ids = [], group_ids = [] } = options
        if (member_ids.length) {
            db.sql`
                insert into class_members (
                    class_id,
                    user_id,
                )
                values ${
                member_ids
                    .map((id) => `(${classId}, ${id})`)
                    .join(',')
            }`
        }
        if (group_ids.length) {
            db.sql`
            insert into class_groups (
                class_id,
                group_id,
            )
            values ${
                group_ids
                    .map((id) => `(${classId}, ${id})`)
                    .join(',')
            }`
        }
        const [c] = db.sql<ApiClass>`
            select * 
            from classes 
            where id = ${classId}`
        return await Promise.resolve(c)
    }

    async delete(id: number): Promise<void> {
        db.sql`
            delete 
            from classes 
            where id = ${id}`
        return await Promise.resolve()
    }

    async get(id: number): Promise<ApiClass> {
        const [c] = db.sql<Omit<dbClasses, 'group_ids' | 'member_ids'>>`
            select * 
            from classes 
            where id = ${id}`
        const group_ids = db.sql<{ group_id: number }>`
            select group_id 
            from class_groups 
            where class_id = ${id}`
        const member_ids = db.sql<{ user_id: number }>`
            select user_id 
            from class_members 
            where class_id = ${id}`
        return await Promise.resolve({
            ...c,
            created_at: new Date(c.created_at).getTime(),
            group_ids: group_ids.map(({ group_id }) => group_id),
            member_ids: member_ids.map(({ user_id }) => user_id),
        })
    }

    async update(
        id: number,
        options: Omit<Partial<ApiClass>, 'id'>,
    ): Promise<ApiClass> {
        const c = await this.get(id)
        if (!c) throw new Error('Class not found')
        if (
            options.name !== c.name ||
            options.subject !== c.subject ||
            options.icon !== c.icon ||
            options.description !== c.description ||
            options.teacher_id !== c.teacher_id
        ) {
            db.sql`
                UPDATE classes
                SET
                    name = ${options.name ?? c.name},
                    subject = ${options.subject ?? c.subject},
                    icon = ${options.icon ?? c.icon ?? null},
                    description = ${options.description ?? c.description ?? null}
                    teacher_id = ${options.teacher_id ?? c.teacher_id}
                WHERE id = ${id}`
        }
        const { member_ids = [], group_ids = [] } = options
        const { member_ids: oldMemberIds, group_ids: oldGroupIds } = c
        const membersToDelete = oldMemberIds.filter((id) => !member_ids.includes(id))
        const membersToAdd = member_ids.filter((id) => !oldMemberIds.includes(id))
        const groupsToDelete = oldGroupIds.filter((id) => !group_ids.includes(id))
        const groupsToAdd = group_ids.filter((id) => !oldGroupIds.includes(id))
        if (membersToDelete.length) {
            for (const id of membersToDelete) {
                db.sql`
                    delete from class_members 
                    where 
                        class_id = ${c.id} 
                        and user_id = ${id}`
            }
        }
        if (membersToAdd.length) {
            for (const id of membersToAdd) {
                db.sql`
                    insert into class_members (
                        class_id,
                        user_id,
                    )
                    values (
                        ${c.id},
                        ${id},
                    )`
            }
        }
        if (groupsToDelete.length) {
            for (const id of groupsToDelete) {
                db.sql`
                    delete from class_groups 
                    where 
                        class_id = ${c.id} 
                        and group_id = ${id}
                    `
            }
        }
        if (groupsToAdd.length) {
            for (const id of groupsToAdd) {
                db.sql`
                    insert into class_groups (
                        class_id,
                        group_id,
                    )
                    values (
                        ${c.id},
                        ${id},
                    )
                    `
            }
        }
        return await this.get(id)
    }
}
