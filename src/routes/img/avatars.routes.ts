import { Hono } from '@hono/mod.ts'
import { imgsController } from '@controller'

const avatarApi = new Hono()

avatarApi.get('/:id', async (ctx) => {
    const id = ctx.req.param('id')
    const f = await imgsController.getAvatar(id)
    return new Response(f)
})

export default avatarApi
