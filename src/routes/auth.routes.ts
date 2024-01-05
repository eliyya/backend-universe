import { Hono } from '@hono/mod.ts'
import { userController } from '@controller'
import { z } from '@zod/mod.ts'
import { zJSONValidator } from '@middlewares/validators.ts'
import { Sentry } from '@error'
import { TOKEN_TYPES, tTokenType } from '@constants'
import { decodeToken, generateToken } from '@utils/token.ts'
import { tUserToken } from '@interfaces/User.ts'
import { Register } from '@classes/Register.ts'

export default new Hono()
    .post(
        '/authorize',
        zJSONValidator(z.object({
            email: z.string().email(),
            password: z.string().min(8),
        })),
        async (ctx) => {
            try {
                const { email, password } = ctx.get('body')
                const token = await userController.login(email, password)
                return ctx.json(token)
            } catch (error) {
                if (error instanceof Error && error.message === 'Invalid user or password') {
                    return ctx.json({ message: 'Invalid user or password' }, 401)
                }
                console.error(error)
                Sentry.captureException(error)
                return ctx.json({ message: 'Internal server error' }, 500)
            }
        },
    )
    .get('/refresh', async (ctx) => {
        const authorization = ctx.req.header('Authorization')
        if (!authorization) {
            return ctx.json({ message: 'Unauthorized' }, 401)
        }
        const [type, token] = authorization.split(' ') as [tTokenType, string]
        const { expires, email, id, created_at } = await decodeToken<tUserToken>(token)
        if (expires < Date.now()) {
            return ctx.json({ message: 'Unauthorized' }, 401)
        }
        if (type !== TOKEN_TYPES.Register) {
            return ctx.json({ message: 'Not implemented' }, 500)
        }
        const user = await (await Register.get(+id)).getUser()
        if (!user) {
            return ctx.json(
                await generateToken({
                    email,
                    id,
                    created_at,
                    type: TOKEN_TYPES.Register,
                }),
            )
        }
        return ctx.json(
            await generateToken({
                email,
                id,
                created_at,
                user,
                type: TOKEN_TYPES.Bearer,
            }),
        )
    })
