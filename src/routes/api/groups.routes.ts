import { Hono } from '@hono/mod.ts'
import { auth } from '@middlewares/auth.ts'
import { groupController } from '@controller'
import { zJSONValidator } from '@middlewares/validators.ts'
import z from '@zod/index.ts'

const groupsApi = new Hono()

groupsApi.get('/', auth, async (ctx) => {
    const groups = await groupController.getAllOfUser(+ctx.var.user.id)
    return ctx.json(groups)
})

groupsApi.post(
    '/',
    auth,
    zJSONValidator(z.object({
        name: z.string(),
        description: z.string().nullable().optional().default(null),
    })),
    async (ctx) => {
        const { name, description } = await ctx.req.json()
        const group = await groupController.create({ name, description, owner_id: ctx.var.user.id })
        return ctx.json(group)
    },
)

export default groupsApi
