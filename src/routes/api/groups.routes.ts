import { Hono } from '@hono/mod.ts'
import { auth } from '@middlewares/auth.ts'
import { groupController } from '@controller'
import { Sentry } from '@error'
import { zJSONValidator } from '@middlewares/validators.ts'
import z from '@zod/index.ts'

const groupsApi = new Hono()

groupsApi.get('/', auth, async (ctx) => {
    const groups = await groupController.getAllOfUser(+ctx.var.user.id)
    return ctx.json(groups)
})

groupsApi.get('/:id', auth, async (ctx) => {
    try {
        const group = await groupController.get(+ctx.req.param('id'))
        return ctx.json(group)
    } catch (error) {
        if (error.message === 'Group not found') return ctx.json({ error: error.message }, 404)
        console.error(error)
        Sentry.captureException(error)
    }
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
        const group = await groupController.create({ name, description, owner_id: +ctx.var.user.id })
        return ctx.json(group)
    },
)

export default groupsApi
