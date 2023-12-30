import { Hono } from '@hono/mod.ts'
import { Sentry } from '@error'
import { auth } from '@middlewares/auth.ts'
import { User } from '@classes/User.ts'

export default new Hono()
    .get('/@me', auth, (ctx) => ctx.json(ctx.var.user))
    .post('/', async (ctx) => {
        const { email, password } = await ctx.req.parseBody<
            { email: string; password: string }
        >()
        if (!email || !password) {
            return ctx.json({ message: 'Invalid user data' }, 400)
        }
        try {
            const x = await User.register(email, password)
            ctx.json(x)
        } catch (error) {
            console.error(error)
            Sentry.captureException(error)
            return ctx.json({ message: 'Internal Server Error' }, 500)
        }
    })
