import { Hono } from '@hono/mod.ts'
import { imgsController } from '@controller'

const avatarApi = new Hono()

avatarApi.get('/:id', async (ctx) => {
    const id = ctx.req.param('id')
    try {
        return new Response(await imgsController.getAvatar(id))
    } catch (error) {
        if (error.toString().includes('NotFound')) return ctx.notFound()
        else return ctx.text('Internal Server Error', 500)
    }
})

export default avatarApi
