import '@dotenv/load.ts'
import '@error'
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

import auth from './routes/auth.routes.ts'
app.route('/auth', auth)
import api from './routes/api.routes.ts'
app.route('/api', api)
import img from './routes/img.routes.ts'
app.route('/img', img)

Deno.serve(app.fetch)
