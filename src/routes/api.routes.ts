import { Hono } from "https://deno.land/x/hono@v3.11.11/mod.ts";
import users from "./api/users.routes.ts";

export default new Hono()
  .route("/users", users);
