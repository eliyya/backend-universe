import { ApiClass } from '@apiTypes'

export interface iClass {
    get(id: number): Promise<ApiClass>
    create(
        options:
            & Omit<Partial<ApiClass>, 'id' | 'created_at'>
            & Pick<ApiClass, 'name' | 'teacher_id' | 'subject'>,
    ): Promise<ApiClass>
    update(
        id: number,
        options: Omit<Partial<ApiClass>, 'id'>,
    ): Promise<ApiClass>
    delete(id: number): Promise<void>
}
