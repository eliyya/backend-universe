import { Hono } from '@hono/mod.ts'
import { Sentry } from '@error'
import { auth } from '@middlewares/auth.ts'
import { User } from '@classes/User.ts'
import { decodeToken } from '@utils/token.ts'
import { tUserToken } from '@interfaces/User.ts'
import { TOKEN_TYPES, tTokenType } from '@constants'
import { zJSONValidator } from '@middlewares/validators.ts'
import z from '@zod/index.ts'

export default new Hono()
    .get('/@me', auth, (ctx) => ctx.json(ctx.var.user))
    .post(
        '/register',
        zJSONValidator(z.object({
            email: z.string().email(),
            password: z.string().min(8),
        })),
        async (ctx) => {
            try {
                const { email, password } = ctx.var.body
                const x = await User.register(email, password)
                return ctx.json(x)
            } catch (error) {
                console.error(error)
                Sentry.captureException(error)
                return ctx.json({ message: 'Internal Server Error' }, 500)
            }
        },
    )
    .post('/create', async (ctx) => {
        const authorization = ctx.req.header('Authorization')
        if (!authorization) {
            return ctx.json({ message: 'Unauthorized' }, 401)
        }
        const [type, token] = authorization.split(' ') as [tTokenType, string]
        if (type !== TOKEN_TYPES.Register) {
            return ctx.json({ message: 'Unauthorized' }, 401)
        }
        const { expires } = await decodeToken<tUserToken>(token)
        if (expires < Date.now()) {
            return ctx.json({ message: 'Unauthorized' }, 401)
        }
        const { username, register_id } = await ctx.req.parseBody<
            { username: string; register_id: string }
        >()
        try {
            const x = await User.create(+register_id, username)
            ctx.json(x)
        } catch (error) {
            console.error(error)
            Sentry.captureException(error)
            return ctx.json({ message: 'Internal Server Error' }, 500)
        }
    })
