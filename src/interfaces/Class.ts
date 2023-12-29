import { Database } from '../database.types.ts'

export type tClass = Database['public']['Tables']['classes']['Row']

export interface iClass {
    get(id: number): Promise<tClass>
    create(
        options:
            & Partial<tClass>
            & Pick<tClass, 'name' | 'teacher_id' | 'subject'>,
    ): Promise<tClass>
    update(
        id: number,
        options: Omit<Partial<tClass>, 'id'>,
    ): Promise<tClass>
    delete(id: number): Promise<void>
}
