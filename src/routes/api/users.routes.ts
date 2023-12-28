import { Hono } from "https://deno.land/x/hono@v3.11.11/mod.ts";
import { userController } from "../../controllers/default.ts";
import { decodeToken } from "../../utils/token.ts";
import { type tuser } from "../../models/User/interface.ts";

export default new Hono()
  .get("/@me", async (ctx) => {
    const token = ctx.req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return ctx.json({ message: "Unauthorized" }, 401);
    }
    try {
      const data = await decodeToken<tuser>(token);
      const user = await userController.get(data.id);
      ctx.body = user;
    } catch (error) {
      return ctx.json({ message: (error as Error).message }, 401);
    }
  })
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
      return ctx.json({ message: (error as Error).message }, 400);
    }
  });
