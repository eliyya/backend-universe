import { Hono } from "https://deno.land/x/hono@v3.11.11/mod.ts";
import { userController } from "../../controllers/default.ts";
import { Sentry } from "../../sentry.ts";
import { auth } from "../../middlewares/auth.ts";

export default new Hono()
  .get("/@me", auth, (ctx) => ctx.json(ctx.var.user))
  .post("/", async (ctx) => {
    const { email, password } = await ctx.req.parseBody<
      { email: string; password: string }
    >();
    if (!email || !password) {
      return ctx.json({ message: "Invalid user data" }, 400);
    }
    try {
      const x = await userController.register(email, password);
      ctx.body = x;
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      return ctx.json({ message: "Internal Server Error" }, 500);
    }
  });
