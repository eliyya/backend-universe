import { db } from '@db'
import { captureException } from '@error'
import { ApiClass } from '@apiTypes'
import { generateId } from '@utils/snowflake.ts'

export class ClassModel {
    async create(
        options:
            & Omit<Partial<ApiClass>, 'id' | 'created_at'>
            & Pick<ApiClass, 'name' | 'teacher_id' | 'subject'>,
    ): Promise<ApiClass> {
        const r = await db.from('classes').insert({
            id: generateId(),
            name: options.name,
            teacher_id: options.teacher_id,
            subject: options.subject,
            description: options.description ?? null,
        }).select()
        if (r.error) {
            captureException(r.error)
            throw new Error(JSON.stringify(r))
        }
        return {
            ...r.data[0],
            created_at: new Date(r.data[0].created_at).getTime(),
        }
    }

    async delete(id: number): Promise<void> {
        await db.from('classes').delete().match({ id })
    }

    async get(id: number): Promise<ApiClass> {
        const r = await db.from('classes').select().match({ id })
        if (r.error) {
            captureException(r.error)
            throw new Error(JSON.stringify(r))
        }
        return {
            ...r.data[0],
            created_at: new Date(r.data[0].created_at).getTime(),
        }
    }

    async update(
        id: number,
        options: Omit<Partial<ApiClass>, 'id'>,
    ): Promise<ApiClass> {
        const c = await this.get(id)
        if (!c) throw new Error(`Class ${id} not found`)
        const r = await db.from('classes').update({
            name: options.name,
            subject: options.subject,
            description: options.description,
            teacher_id: options.teacher_id,
        }).match({ id }).select()
        if (r.error) {
            captureException(r.error)
            throw new Error(JSON.stringify(r))
        }
        return {
            ...r.data[0],
            created_at: new Date(r.data[0].created_at).getTime(),
        }
    }
}
