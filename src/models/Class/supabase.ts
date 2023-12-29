import { iClass, tClass } from '@interfaces/Class.ts'
import supabase from '@db/supabase.ts'
import { Sentry } from '@error'

export class Class implements iClass {
    async create(
        options:
            & Omit<Partial<tClass>, 'id' | 'created_at'>
            & Pick<tClass, 'name' | 'teacher_id' | 'subject'>,
    ): Promise<tClass> {
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
            console.error(r.error)
            Sentry.captureException(r.error)
            throw new Error(JSON.stringify(r))
        }
        return r.data[0]
    }

    async delete(id: number): Promise<void> {
        await supabase.from('classes').delete().match({ id })
    }

    async get(id: number): Promise<tClass> {
        const r = await supabase.from('classes').select().match({ id })
        if (r.error) {
            console.error(r.error)
            Sentry.captureException(r.error)
            throw new Error(JSON.stringify(r))
        }
        return r.data[0]
    }

    async update(
        id: number,
        options: Omit<Partial<tClass>, 'id'>,
    ): Promise<tClass> {
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
            console.error(r.error)
            Sentry.captureException(r.error)
            throw new Error(JSON.stringify(r))
        }
        return r.data[0]
    }
}
