import { Router } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import users from "./api/users.routes.ts";

export default new Router()
  .use("/users", users.routes());
