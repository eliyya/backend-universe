import { MiddlewareHandler } from '@hono/mod.ts'
import { Sentry } from '@error'

type tSafeMiddleware = (
    fn?: (error: Error, ctx: Parameters<MiddlewareHandler>[0], next: Parameters<MiddlewareHandler>[1]) => any,
) => MiddlewareHandler

export const safe: tSafeMiddleware = (fn) => async (ctx, next) => {
    try {
        return await next()
    } catch (err) {
        return (fn ?? ((error, ctx) => {
            console.error('safe', error)
            Sentry.captureException(error)
            return ctx.json({ error: 'Internal Server Error' }, 500)
        }))(err, ctx, next)
    }
}
