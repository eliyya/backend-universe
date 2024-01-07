import { ImgModel } from '@interfaces/Imgs.ts'

export class ImgSqliteModel implements ImgModel {
    async getAvatar(id: string): Promise<File> {
        const img = await Deno.readFile(Deno.cwd() + `/sql/storage/avatars/${id}`)
            .catch(() => Deno.readFile(Deno.cwd() + `/sql/storage/avatars/olds/${id}`))
        return new File([img], id, { type: 'image/png' })
    }
}
