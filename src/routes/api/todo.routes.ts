import { Router } from 'https://deno.land/x/oak@v12.6.0/mod.ts'
import { userController } from '../../controllers/default.ts'
import { decodeToken } from '../../utils/token.ts'
import { type tuser } from '../../models/User/interface.ts'

export default new Router()
    .get('/:ID', async (ctx) => {
        const id = ctx.params.ID
        const token = ctx.request.headers.get('Authorization')?.split(' ')[1]
        if (!token) {
            ctx.response.status = 401
            ctx.response.body = { message: 'Unauthorized' }
            return
        }
        let user: tuser | undefined
        try {
            const data = await decodeToken<tuser>(token)
            user = await userController.get(data.id)
        } catch (error) {
            ctx.response.status = 401
            ctx.response.body = { message: (error as Error).message }
        }
        if (!user) {
            ctx.response.status = 401
            ctx.response.body = { message: 'Unauthorized' }
            return
        }
        
    })
    // .post('/', async (ctx) => {
    //     if (!ctx.request.hasBody) {
    //         ctx.response.status = 400
    //         ctx.response.body = { message: 'Invalid user data' }
    //         return
    //     }
    //     const { user, password } = await ctx.request.body({ type: 'json' }).value ?? {}
    //     if (!user || !password) {
    //         ctx.response.status = 400
    //         ctx.response.body = { message: 'Invalid user data' }
    //         return
    //     }
    //     try {
    //         const x = await userController.register(user, password)
    //         ctx.response.body = x
    //     } catch (error) {
    //         console.error(error)
    //         ctx.response.status = 400
    //         ctx.response.body = { message: error.message }
    //         return
    //     }
    // })

    



    