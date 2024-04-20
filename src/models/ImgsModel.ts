
import { storage } from '@db'

export class ImgModel {
    /**
     * 
     * @param {string} id - User id
     * @returns {Promise<File>} User avatar
     * @throws {StorageError}
     * @example await getAvatar("1")
     */
    async getAvatar(id: string): Promise<File> {
        const f = await storage
            .download(`avatar/${id}.png`)
        if (f.error) throw f.error
        return new File([f.data], id, { type: f.data.type })
    }

    /**
     * @description Set user avatar
     * @param {string} id User id
     * @param {File} avatar User avatar
     * @returns {Promise<void>} Updated user
     * @throws {SupabaseError}
     * @throws {StorageError}
     * @example await setAvatar(1, pngAvatar)
     */
    async setAvatar(id: string, avatar: File): Promise<void> {
        const a = await storage
            .upload(`avatar/${id}.png`, avatar)
        if (a.error) {
            throw a.error
        }
    }
}
