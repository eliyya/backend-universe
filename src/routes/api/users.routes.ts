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
    .post('/', async (ctx) => {
        if (!ctx.request.hasBody) {
            ctx.response.status = 400;
            ctx.response.body = { message: 'Invalid user data' };
            return;
        }
        const { user, password } = await ctx.request.body({ type: 'json' }).value ?? {};
        if (!user || !password) {
            ctx.response.status = 400;
            ctx.response.body = { message: 'Invalid user data' };
            return;
        }
        try {
            const {data, error} = await User.register(user, password)
            if (error) throw new Error(error);
            ctx.response.body = data
        } catch (error) {
            console.log(error);
            ctx.response.status = 400;
            ctx.response.body = { message: error.message };
            return;
        }
    })

    



    