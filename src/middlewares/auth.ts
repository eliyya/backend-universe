import { type MiddlewareHandler } from '@hono/mod.ts'
import { userController } from '@controller'
import { type tUser } from '@interfaces/User.ts'
import { decodeToken } from '@utils/token.ts'
import { Sentry } from '@error'

export const auth: MiddlewareHandler<{ Variables: { user: tUser } }> = async (
    ctx,
    next,
) => {
    try {
        const token = ctx.req.header('Authorization')
        if (!token) {
            return ctx.json({ message: 'Unauthorized' }, 401)
        }

        const data = await decodeToken<tUser>(token)
        const user = await userController.get(data.id)
        if (!user) {
            return ctx.json({ message: 'Unauthorized' }, 401)
        }
        ctx.set('user', user)
        next()
    } catch (error) {
        console.error(error)
        Sentry.captureException(error)
        return ctx.json({ message: 'Internal Server Error' }, 500)
    }
}
