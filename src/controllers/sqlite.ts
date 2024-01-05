import { User } from '@models/User/sqlite.ts'
import { Class } from '@models/Class/sqlite.ts'
import { ImgsModel } from '@models/Imgs/sqlite.ts'
export const userController = new User()
export const classController = new Class()
export const imgsController = new ImgsModel()
