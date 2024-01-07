import { UserSqliteModel } from '@models/User/sqlite.ts'
import { ClassSqliteModel } from '@models/Class/sqlite.ts'
import { ImgSqliteModel } from '@models/Imgs/sqlite.ts'
import { GroupSqliteModel } from '@models/Group/sqlite.ts'

export const userController = new UserSqliteModel()
export const classController = new ClassSqliteModel()
export const imgsController = new ImgSqliteModel()
export const groupController = new GroupSqliteModel()
