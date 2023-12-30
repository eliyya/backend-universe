import { type MiddlewareHandler } from '@hono/mod.ts'
import { type tUserToken } from '@interfaces/User.ts'
import { decodeToken } from '@utils/token.ts'
import { Sentry } from '@error'
import { User } from '@classes/User.ts'

export const auth: MiddlewareHandler<{ Variables: { user: User } }> = async (
    ctx,
    next,
) => {
    try {
        const authorization = ctx.req.header('Authorization')
        if (!authorization) {
            return ctx.json({ message: 'Unauthorized' }, 401)
        }
        const [type, token] = authorization.split(' ')
        if (type !== 'Bearer') {
            return ctx.json({ message: 'Unauthorized' }, 401)
        }
        const { user, expires } = await decodeToken<tUserToken>(token)
        if (expires < Date.now()) {
            return ctx.json({ message: 'Unauthorized' }, 401)
        }
        if (!user) {
            return ctx.json({ message: 'Unauthorized' }, 401)
        }
        const u = await User.get(user.id)
        ctx.set('user', u)
        next()
    } catch (error) {
        console.error(error)
        Sentry.captureException(error)
        return ctx.json({ message: 'Internal Server Error' }, 500)
    }
}
