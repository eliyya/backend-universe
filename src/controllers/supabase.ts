import { UserSupabaseModel } from '@models/User/supabase.ts'
import { ClassSupabaseModel } from '@models/Class/supabase.ts'
import { ImgSupabaseModel } from '../models/Imgs/supabase.ts'
import { GroupSupabaseModel } from '@models/Group/supabase.ts'

export const userController = new UserSupabaseModel()
export const classController = new ClassSupabaseModel()
export const imgsController = new ImgSupabaseModel()
export const groupController = new GroupSupabaseModel()
