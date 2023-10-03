import { Router } from 'https://deno.land/x/oak@v12.6.0/mod.ts'
import { userController } from '../../controllers/default.ts'
import { decodeToken } from '../../utils/token.ts'
import { type tuser } from '../../models/User.ts'

export default new Router()
    .get('/@me', async (ctx) => {
        const token = ctx.request.headers.get('Authorization')?.split(' ')[1]
        if (!token) {
            ctx.response.status = 401
            ctx.response.body = { message: 'Unauthorized' }
            return
        }
        try {
            const data = await decodeToken<tuser>(token)
            ctx.response.body = data
        } catch (error) {
            ctx.response.status = 401
            ctx.response.body = { message: (error as Error).message }
        }
        
    })
    .post('/', async (ctx) => {
        if (!ctx.request.hasBody) {
            ctx.response.status = 400
            ctx.response.body = { message: 'Invalid user data' }
            return
        }
        const { user, password } = await ctx.request.body({ type: 'json' }).value ?? {}
        if (!user || !password) {
            ctx.response.status = 400
            ctx.response.body = { message: 'Invalid user data' }
            return
        }
        try {
            const x = await userController.register(user, password)
            ctx.response.body = x
        } catch (error) {
            console.log(error)
            ctx.response.status = 400
            ctx.response.body = { message: error.message }
            return
        }
    })

    



    