import { Hono } from '@hono/mod.ts'
import { userController } from '@controller'
import { z } from '@zod/mod.ts'
import { zJSONValidator } from '@middlewares/validators.ts'
import { Sentry } from '@error'

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
