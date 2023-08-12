import "https://deno.land/x/dotenv@v3.2.2/load.ts";
import { Application } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { join } from "https://deno.land/std@0.193.0/path/mod.ts";
import {loadRouters} from './utils.ts'
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const app = new Application();
app.use(oakCors({ origin: "*" }));
// router handler
await loadRouters(join(Deno.cwd(), "src","routes"), app)

await app.listen({ port: 8000 });
console.log("Server running on port http://localhost:8000");
