import { type MiddlewareHandler } from '@hono/mod.ts'
import { z, type ZodObject, ZodType, type ZodTypeAny } from '@zod/mod.ts'
import { captureException } from '@error'

type zJSONValidatorFunction = <
    T extends { [k: string]: ZodTypeAny },
    U extends ZodObject<T>,
>(
    schema: U,
) => MiddlewareHandler<{ Variables: { body: z.infer<typeof schema> } }>

export const zJSONValidator: zJSONValidatorFunction = (schema) => async (ctx, next) => {
    try {
        const c = await ctx.req.json()
        if (!c) return ctx.json({ message: 'Invalid request' }, 400)
        const parsed = schema.safeParse(c)
        if (!parsed.success) {
            return ctx.json({
                message: 'Invalid request',
                error: parsed.error.issues.map((e) => ({ path: e.path[0], message: e.message })),
            }, 400)
        }
        ctx.set('body', parsed.data)
        return await next()
    } catch (error) {
        if (
            error instanceof SyntaxError && (
                error.message.includes('Unexpected end of JSON input') ||
                error.message.includes('Is not valid JSON') ||
                error.message.includes('Expected double-quoted property name in JSON')
            )
        ) {
            return ctx.json({
                message: 'Invalid request',
                error: [{ message: 'Invalid JSON' }],
            }, 400)
        }
        captureException(error)
        return ctx.json({ message: 'Internal Server Error' }, 500)
    }
}

type zFormValidatorFunction = <
    T extends { [k: string]: ZodTypeAny | ZodType<File, z.ZodTypeDef, File> },
>(
    propertiesSchema: T,
) => MiddlewareHandler<{ Variables: { body: z.infer<ZodObject<T>>; bodyForm: FormData } }>

export const zFormValidator: zFormValidatorFunction = (propertiesSchema) => async (ctx, next) => {
    try {
        const ct = ctx.req.header('Content-Type')
        if (!ct || !ct.includes('multipart/form-data')) {
            return ctx.json({ message: 'Invalid request' }, 400)
        }
        const fd = await ctx.req.formData()

        const parsed = z.object(propertiesSchema).safeParse(formToObject(fd))
        if (!parsed.success) {
            return ctx.json({
                message: 'Invalid request',
                error: parsed.error.issues.map((e) => ({ path: e.path[0], message: e.message })),
            }, 400)
        }
        new FormData()
        ctx.set('body', parsed.data)
        ctx.set('bodyForm', fd)
        return await next()
    } catch (error) {
        captureException(error)
        return ctx.json({ message: 'Internal Server Error' }, 500)
    }
}

const formToObject = <T extends { [k: string]: any }>(fd: FormData): T | { [k: string]: any } => {
    const o: { [k: string]: any } = {}
    for (const [k, v] of fd.entries()) {
        o[k] = v
    }
    return o
}

const objectToForm = <T extends { [k: string]: any }>(o: T): FormData => {
    const fd = new FormData()
    for (const [k, v] of Object.entries(o)) {
        fd.append(k, v)
    }
    return fd
}
