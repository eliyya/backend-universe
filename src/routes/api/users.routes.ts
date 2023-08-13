import { Router } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import User from "../../models/User.ts";

export default new Router()
    .get('/@me', async (ctx) => {
        const token = ctx.request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            ctx.response.status = 401;
            ctx.response.body = { message: 'Unauthorized' };
            return;
        }
        const data = await User.decodeToken(token);
        if (data.error) {
            ctx.response.status = 401;
            ctx.response.body = { message: data.error };
            return;
        }
        ctx.response.body = data.user;
    })