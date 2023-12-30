import { Hono } from '@hono/mod.ts'
import { userController } from '@controller'
import { z } from '@zod/mod.ts'
import { zJSONValidator } from '@middlewares/validators.ts'

export default new Hono()
    .post(
        '/authorize',
        zJSONValidator(z.object({
            email: z.string().email(),
            password: z.string().min(8),
        })),
        async (ctx) => {
            const body = ctx.get('body')
            const { email, password } = body
            const token = await userController.login(email, password)
            return ctx.json(token)
        },
    )
