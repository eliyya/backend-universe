import { Hono } from '@hono/mod.ts'
import { auth } from '@middlewares/auth.ts'
import { groupController } from '@controller'

const groupsApi = new Hono()

groupsApi.get('/', auth, async (ctx) => {
    const groups = await groupController.getAllOfUser(+ctx.var.user.id)
    return ctx.json(groups)
})

export default groupsApi
