import { type MiddlewareHandler } from "https://deno.land/x/hono@v3.11.11/mod.ts";
import { userController } from "../controllers/default.ts";
import { type tuser } from "../models/User/interface.ts";
import { decodeToken } from "../utils/token.ts";
import { Sentry } from "../sentry.ts";

export const auth: MiddlewareHandler<{ Variables: { user: tuser } }> = async (
  ctx,
  next,
) => {
  try {
    const token = ctx.req.header("Authorization");
    if (!token) {
      return ctx.json({ message: "Unauthorized" }, 401);
    }

    const data = await decodeToken<tuser>(token);
    const user = await userController.get(data.id);
    if (!user) {
      return ctx.json({ message: "Unauthorized" }, 401);
    }
    ctx.set("user", user);
    next();
  } catch (error) {
    console.error(error);
    Sentry.captureException(error);
    return ctx.json({ message: "Internal Server Error" }, 500);
  }
};
