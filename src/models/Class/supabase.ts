import { ClassModel } from '@interfaces/Class.ts'
import supabase from '@db/supabase.ts'
import { captureException } from '@error'
import { ApiClass } from '@apiTypes'

export class ClassSupabaseModel implements ClassModel {
    async create(
        options:
            & Omit<Partial<ApiClass>, 'id' | 'created_at'>
            & Pick<ApiClass, 'name' | 'teacher_id' | 'subject'>,
    ): Promise<ApiClass> {
        const r = await supabase.from('classes').insert({
            name: options.name,
            teacher_id: options.teacher_id,
            subject: options.subject,
            group_ids: options.group_ids ?? [],
            member_ids: options.member_ids ?? [],
            description: options.description ?? null,
            icon: options.icon ?? null,
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
        await supabase.from('classes').delete().match({ id })
    }

    async get(id: number): Promise<ApiClass> {
        const r = await supabase.from('classes').select().match({ id })
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
        const r = await supabase.from('classes').update({
            name: options.name,
            subject: options.subject,
            icon: options.icon,
            description: options.description,
            teacher_id: options.teacher_id,
            group_ids: options.group_ids,
            member_ids: options.member_ids,
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
