import { UserModel } from '@models/User/supabase.ts'
import { ClassModel } from '@models/Class/supabase.ts'
import { ImgsModel } from '../models/Imgs/Supabase.ts'
export const userController = new UserModel()
export const classController = new ClassModel()
export const imgsController = new ImgsModel()
