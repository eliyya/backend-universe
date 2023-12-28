import { Hono } from "https://deno.land/x/hono@v3.11.11/mod.ts";
import { userController } from "../controllers/default.ts";

export default new Hono()
  .post("/authorize", async (ctx) => {
    const body = await ctx.req.parseBody<{ email: string; password: string }>();
    if (!Object.keys(body).length) {
      return ctx.json({ message: "Invalid request" }, 400);
    }
    const { email, password } = body;
    const token = await userController.login(email, password);
    return ctx.json(token);
  })
  .get("/authorize", (ctx) => {
    return ctx.json({ message: "Hello World" });
  });
