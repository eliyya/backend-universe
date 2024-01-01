import { Hono } from '@hono/mod.ts'

const imgApi = new Hono()

import avatarApi from './img/avatars.routes.ts'
imgApi.route('/avatars', avatarApi)

export default imgApi
