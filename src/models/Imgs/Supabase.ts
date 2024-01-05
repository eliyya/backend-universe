import { iImgsModel } from '@interfaces/Imgs.ts'
import supabase from '@db/supabase.ts'

export class ImgsModel implements iImgsModel {
    async getAvatar(id: string): Promise<File> {
        const f = await supabase
            .storage
            .from('avatars')
            .download(id)
        if (f.error) throw new Error(f.error.message)
        return new File([f.data], id, { type: f.data.type })
    }
}
