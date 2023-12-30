import { type MiddlewareHandler } from '@hono/mod.ts'
import { z, type ZodObject, type ZodTypeAny } from '@zod/mod.ts'
import { Sentry } from '@error'

type zJSONValidatorFunction = <
    T extends { [k: string]: ZodTypeAny },
    U extends ZodObject<T>,
>(
    schema: U,
) => MiddlewareHandler<{ Variables: { body: z.infer<typeof schema> } }>

export const zJSONValidator: zJSONValidatorFunction = (schema) => async (ctx, next) => {
    const c = await ctx.req.json().catch((error) => {
        if (
            error instanceof SyntaxError && (
                error.message.includes('Unexpected end of JSON input') ||
                error.message.includes('is not valid JSON')
            )
        ) {
            return ctx.json({
                message: 'Invalid request',
                error: [{ message: 'Invalid JSON' }],
            }, 400)
        }
        console.error(error)
        Sentry.captureException(error)
    })
    if (!c) return
    const parsed = schema.safeParse(c)
    if (!parsed.success) {
        return ctx.json({
            message: 'Invalid request',
            error: parsed.error.issues.map((e) => ({ path: e.path[0], message: e.message })),
        }, 400)
    }
    ctx.set('body', parsed.data)
    next()
}
