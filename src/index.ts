import '@dotenv/load.ts'
import { Hono } from '@hono/mod.ts'
import { cors, logger } from '@hono/middleware.ts'
import { captureException } from '@error'

if (!Deno.env.get('JWT_SECRET')) Deno.exit(1)

const app = new Hono()

app.use('*', cors())
app.use('*', logger())
app.onError((error, ctx) => {
    captureException(error)
    return ctx.json({ message: 'Internal server error' }, 500)
})


import _0 from './routes/auth.routes.ts'
app.route('/auth', _0)
import _1 from './routes/api/users.routes.ts'
app.route('/api/users', _1)
import _2 from './routes/api/users/@me.routes.ts'
app.route('/api/users/@me', _2)
import _3 from './routes/api/groups.routes.ts'
app.route('/api/groups', _3)
import _4 from './routes/api/groups/:id.routes.ts'
app.route('/api/groups/:id', _4)
import _5 from './routes/img/avatars.routes.ts'
app.route('/img/avatars', _5)

Deno.serve(app.fetch)