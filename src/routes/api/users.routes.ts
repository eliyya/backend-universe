import { Hono } from '@hono/mod.ts'
import { Sentry } from '@error'
import { User } from '@classes/User.ts'
import { decodeToken } from '@utils/token.ts'
import { tUserToken } from '@interfaces/User.ts'
import { TOKEN_TYPES, tTokenType } from '@constants'
import { zJSONValidator } from '@middlewares/validators.ts'
import z from '@zod/index.ts'

import me from './users/@me.ts'
import { safe } from '@middlewares/safe.ts'
export default new Hono()
    .post(
        '/register',
        zJSONValidator(z.object({
            email: z.string().email(),
            password: z.string().min(8),
        })),
        safe((error, ctx) => {
            if (error.message.includes('Email already registered')) {
                return ctx.json({ message: error.message }, 409)
            }
            console.error(error)
            Sentry.captureException(error)
            return ctx.json({ message: 'Internal Server Error' }, 500)
        }),
        async (ctx) => {
            const { email, password } = ctx.var.body
            const x = await User.register(email, password)
            return ctx.json(x)
        },
    )
    .post(
        '/create',
        zJSONValidator(z.object({
            username: z.string(),
        })),
        async (ctx) => {
            const authorization = ctx.req.header('Authorization')
            if (!authorization) {
                return ctx.json({ message: 'Unauthorized' }, 401)
            }
            const [type, token] = authorization.split(' ') as [tTokenType, string]
            if (type !== TOKEN_TYPES.Register) {
                return ctx.json({ message: 'Unauthorized' }, 401)
            }
            const { expires, id } = await decodeToken<tUserToken>(token)
            if (expires < Date.now()) {
                return ctx.json({ message: 'Unauthorized' }, 401)
            }
            const { username } = ctx.var.body
            const x = await User.create(+id, username)
            return ctx.json(x)
        },
    )
    .route('/@me', me)
