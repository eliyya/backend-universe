import { Hono } from '@hono/mod.ts'
import { auth } from '@middlewares/auth.ts'
import { zFormValidator, zJSONValidator } from '@middlewares/validators.ts'
import z from '@zod/index.ts'
import { Sentry } from '@error'

const userApi = new Hono()
userApi.get('/', auth, (ctx) => ctx.json(ctx.var.user))
userApi.patch(
    '/',
    auth,
    zJSONValidator(z.object({
        username: z.string().optional(),
        displayname: z.string().optional().nullable(),
    })),
    async (ctx) => {
        try {
            const x = await ctx.var.user.update({
                username: ctx.var.body.username,
                displayname: ctx.var.body.displayname,
            })
            return ctx.json(x)
        } catch (error) {
            if (error.message === 'Username already registered') {
                return ctx.json({ message: error.message }, 409)
            }
            Sentry.captureException(error)
            console.error(error)
            return ctx.json({ message: 'Internal Server Error' }, 500)
        }
    },
)
userApi.post(
    '/avatar',
    auth,
    zFormValidator({
        avatar: z.instanceof(File),
    }),
    async (ctx) => {
        const { avatar } = ctx.var.body
        const u = await ctx.var.user.setAvatar(avatar)
        return ctx.json(u)
    },
)
export default userApi
