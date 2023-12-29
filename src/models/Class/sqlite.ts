import db from '@db/sqlite.ts'
import { iClass, tClass } from '@interfaces/Class.ts'

export class Class implements iClass {
    // deno-lint-ignore require-await
    async create(
        options:
            & Partial<tClass>
            & Pick<tClass, 'name' | 'teacher_id' | 'subject'>,
    ): Promise<tClass> {
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
                member_ids.map((id) => `(${classId}, ${id})`).join(
                    ',',
                )
            }
            `
        }
        if (group_ids.length) {
            db.sql`
            insert into class_groups (
                class_id,
                group_id,
            )
            values ${
                group_ids.map((id) => `(${classId}, ${id})`).join(
                    ',',
                )
            }
            `
        }
        const [c] = db.sql<tClass>`
        select * from classes where id = ${classId}
        `
        return c
    }

    // deno-lint-ignore require-await
    async delete(id: number): Promise<void> {
        db.sql`
        delete from classes where id = ${id}
        `
    }

    // deno-lint-ignore require-await
    async get(id: number): Promise<tClass> {
        const [c] = db.sql<tClass>`
        select * from classes where id = ${id}
        `
        return c
    }

    // deno-lint-ignore require-await
    async update(
        id: number,
        options: Omit<Partial<tClass>, 'id'>,
    ): Promise<tClass> {
        const [c] = db.sql<tClass>`
        update classes set ${
            Object.entries(options).map(([key, value]) => `${key} = ${value}`)
                .join(',')
        } where id = ${id}
        `
        return c
    }
}
