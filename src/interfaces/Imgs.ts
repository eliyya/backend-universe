export interface ImgModel {
    getAvatar(id: string): Promise<File>
}
