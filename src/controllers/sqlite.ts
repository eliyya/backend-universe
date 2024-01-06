import { UserModel } from '@models/User/sqlite.ts'
import { ClassModel } from '@models/Class/sqlite.ts'
import { ImgsModel } from '@models/Imgs/sqlite.ts'
import { GroupModel } from '@models/Group/sqlite.ts'
export const userController = new UserModel()
export const classController = new ClassModel()
export const imgsController = new ImgsModel()
export const groupController = new GroupModel()
