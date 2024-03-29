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

// IMPORTANT: DON'T TOUCH THIS LINES

import authApi from './routes/auth.routes.ts'
app.route('/auth', authApi)
import usersApi from './routes/api/users.routes.ts'
app.route('/api/users', usersApi)
import idApi from './routes/api/groups/:id.routes.ts'
app.route('/api/groups/:id', idApi)
import meApi from './routes/api/users/@me.routes.ts'
app.route('/api/users/@me', meApi)
import groupsApi from './routes/api/groups.routes.ts'
app.route('/api/groups', groupsApi)
import avatarsApi from './routes/img/avatars.routes.ts'
app.route('/img/avatars', avatarsApi)
Deno.serve(app.fetch)
