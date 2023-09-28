import 'https://deno.land/std@0.199.0/dotenv/load.ts'
import { Application, Router } from 'https://deno.land/x/oak@v12.6.0/mod.ts'
import { oakCors } from 'https://deno.land/x/cors@v1.2.2/mod.ts'
import auth from './routes/auth.routes.ts'
import api from './routes/api.routes.ts'

const app = new Application()
app.use(oakCors())
// router handler
const router = new Router()
router.use('/auth', auth.routes(), auth.allowedMethods())
router.use('/api', api.routes(), api.allowedMethods())
app.use(router.routes())

console.log('Server running on port http://localhost:8000')
const PORT = parseInt(Deno.env.get('PORT') as string) || 25565
await app.listen({ port: PORT })
