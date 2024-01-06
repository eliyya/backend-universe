import { Hono } from '@hono/mod.ts'
import { auth } from '@middlewares/auth.ts'

const groupsApi = new Hono()

groupsApi.get('/', auth, (ctx) => {
    return ctx.json({ message: 'Hello, World!' })
})

export default groupsApi
