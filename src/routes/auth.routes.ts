import { Router } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import User from "../models/User.ts";
// Create a single supabase client for interacting with your database


// const codes = new Map<string, string>();
const router = new Router();

router
  .post("/authorize", async (ctx) => {
    // revisamos si existe un body
    if (!ctx.request.hasBody) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Invalid request" };
      return;
    }
    const { user, password } = await ctx.request.body({ type: "json" }).value;
    const token = await User.generateToken(user, password);
    if (token.error) {
      ctx.response.status = 401;
      ctx.response.body = { message: token.error };
      return;
    }
    ctx.response.body = token;
  })

export default router;
