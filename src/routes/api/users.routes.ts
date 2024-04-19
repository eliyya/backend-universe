import { Hono } from '@hono/mod.ts'
import { User } from '@classes/User.ts'
import { decodeToken } from '@utils/token.ts'
import { tUserToken } from '@interfaces/User.ts'
import { TOKEN_TYPES, TokenType } from '@constants'
import { zJSONValidator } from '@middlewares/validators.ts'
import z from '@zod/index.ts'

const usersApi = new Hono()
usersApi.post(
    '/register',
    zJSONValidator(z.object({
        email: z.string().email(),
        password: z.string().min(8),
    })),
    async (ctx) => {
        const { email, password } = ctx.var.body
        const x = await User.register(email, password)
        return ctx.json(x)
    },
)
usersApi.post(
    '/create',
    zJSONValidator(z.object({
        username: z.string(),
    })),
    async (ctx) => {
        const authorization = ctx.req.header('Authorization')
        if (!authorization) {
            return ctx.json({ message: 'Unauthorized' }, 401)
        }
        const [type, token] = authorization.split(' ') as [TokenType, string]
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

// not @me
usersApi.get('/:id', async (ctx, next) => {
    const id = ctx.req.param('id')
    if (id === '@me') {
        return await next()
    }
    const x = await User.get(+id)
    return ctx.json(x)
})

export default usersApi
