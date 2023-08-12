import { join } from "https://deno.land/std@0.193.0/path/mod.ts";
import { Router } from "https://deno.land/x/oak@v12.6.0/mod.ts";

const router = new Router();
// const __dirname = new URL('.', import.meta.url).pathname;

router
  .get("/preview", async (ctx) => {
    ctx.response.body = new TextDecoder("utf-8").decode(await Deno.readFile(join(Deno.cwd(), "src","renders","app.html")));
  })

export default router;
