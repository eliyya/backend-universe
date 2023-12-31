import { UserModel } from '@models/User/supabase.ts'
import { Class } from '@models/Class/supabase.ts'
export const userController = new UserModel()
export const classController = new Class()
