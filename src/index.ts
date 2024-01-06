import '@dotenv/load.ts'
import { Hono } from '@hono/mod.ts'
import { cors, logger } from '@hono/middleware.ts'
import { Sentry } from '@error'

if (!Deno.env.get('JWT_SECRET')) Deno.exit(1)

const app = new Hono()

app.use('*', cors())
app.use('*', logger())
app.onError((error, ctx) => {
    console.error(error)
    Sentry.captureException(error)
    return ctx.json({ message: 'Internal server error' }, 500)
})

import authApi from './routes/auth.routes.ts'
app.route('/auth', authApi)
import avatarApi from './routes/img/avatars.routes.ts'
app.route('/img/avatars', avatarApi)
import usersApi from './routes/api/users.routes.ts'
app.route('/api/users', usersApi)
import groupsApi from './routes/api/groups.routes.ts'
app.route('/api/groups', groupsApi)
import meApi from './routes/api/users/@me.routes.ts'
app.route('/api/users/@me', meApi)

Deno.serve(app.fetch)
