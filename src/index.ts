import '@dotenv/load.ts'
import '@error'
import { Hono } from '@hono/mod.ts'
import { cors, logger } from '@hono/middleware.ts'

if (!Deno.env.get('JWT_SECRET')) Deno.exit(1)
console.log(Deno.env.toObject())

const app = new Hono()

app.use(cors())
app.use(logger((c) => console.log(c)))
app.get('/id', (c) => c.text(`Hello`))

import auth from './routes/auth.routes.ts'
app.route('/auth', auth)
import api from './routes/api.routes.ts'
app.route('/api', api)

Deno.serve(app.fetch)
