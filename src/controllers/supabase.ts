import { UserModel } from '@models/User/supabase.ts'
import { Class } from '@models/Class/supabase.ts'
import { ImgsModel } from '../models/Imgs/Supabase.ts'
export const userController = new UserModel()
export const classController = new Class()
export const imgsController = new ImgsModel()
