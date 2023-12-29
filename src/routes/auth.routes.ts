import { Hono } from '@hono/mod.ts'
import { userController } from '@controller'

export default new Hono()
    .post('/authorize', async (ctx) => {
        const body = await ctx.req.parseBody<
            { email: string; password: string }
        >()
        if (!Object.keys(body).length) {
            return ctx.json({ message: 'Invalid request' }, 400)
        }
        const { email, password } = body
        const token = await userController.login(email, password)
        return ctx.json(token)
    })
