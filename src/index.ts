import "https://deno.land/std@0.199.0/dotenv/load.ts";
import { Hono } from "https://deno.land/x/hono@v3.11.11/mod.ts";
import { cors, logger } from "https://deno.land/x/hono@v3.11.11/middleware.ts";

import auth from "./routes/auth.routes.ts";
import api from "./routes/api.routes.ts";

if (!Deno.env.get("JWT_SECRET")) Deno.exit(1);

const app = new Hono();

app.use(cors());
app.use(logger((c) => console.log(c)));
app.get("/id", (c) => c.text(`Hello`));

app.route("/auth", auth);
app.route("/api", api);

Deno.serve(app.fetch);
