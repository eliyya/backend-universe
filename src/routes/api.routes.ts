import { Hono } from '@hono/mod.ts'
import users from './api/users.routes.ts'

export default new Hono()
    .route('/users', users)
