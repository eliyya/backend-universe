import { Hono } from '@hono/mod.ts'
import { userController } from '@controller'
import { decodeToken } from '@utils/token.ts'
import { type tuser } from '@models/User/interface.ts'

export default new Hono()
    .get('/:ID', async (ctx) => {
        const token = ctx.req.header('Authorization')?.split(' ')[1]
        if (!token) {
            return ctx.json({ message: 'Unauthorized' }, 401)
        }
        let user: tuser | undefined
        try {
            const data = await decodeToken<tuser>(token)
            user = await userController.get(data.id)
        } catch (error) {
            console.log(error)
            return ctx.json({ message: (error as Error).message }, 401)
        }
        if (!user) {
            return ctx.json({ message: 'Unauthorized' }, 401)
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
