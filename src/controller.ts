import { UserModel } from '@models/UserModel.ts'
import { ClassModel } from '@models/ClassModel.ts'
import { ImgModel } from '@models/ImgsModel.ts'
import { GroupModel } from '@models/GroupModel.ts'

export const userController = new UserModel()
export const classController = new ClassModel()
export const imgsController = new ImgModel()
export const groupController = new GroupModel()
