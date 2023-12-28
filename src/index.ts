import "https://deno.land/std@0.199.0/dotenv/load.ts";
import { Hono } from "https://deno.land/x/hono@v3.11.11/mod.ts";
import { cors, logger } from "https://deno.land/x/hono@v3.11.11/middleware.ts";
import * as Sentry from "https://deno.land/x/sentry/index.mjs";

// import auth from "./routes/auth.routes.ts";
// import api from "./routes/api.routes.ts";

if (!Deno.env.get("JWT_SECRET")) Deno.exit(1);
// console.log(Deno.env.get("SENTRY_DNS"));

Sentry.init({
  dsn: Deno.env.get("SENTRY_DSN"),
});
Sentry.getCurrentScope().setExtra("battery", 0.7).setTag("user_mode", "admin")
  .setUser({ id: "4711" });

// Add a breadcrumb for future events
Sentry.addBreadcrumb({
  message: "My Breadcrumb",
  // ...
});
Sentry.captureMessage("Hello, world!");
Sentry.captureException(new Error("Good bye"));
Sentry.captureEvent({
  message: "Manual",
});

// const transaction = startTransaction({
//   op: "test",
//   name: "My First Test Transaction",
// });

// setTimeout(() => {
//   //   try {
//   throw new Error("Test");
//   //   } catch (e) {
//   // captureException(e);
//   //   } finally {
//   // transaction.finish();
//   //   }
// }, 99);

const app = new Hono();

app.use(cors());
app.use(logger((c) => console.log(c)));
app.get("/id", (c) => c.text(`Hello`));

// app.route("/auth", auth);
// app.route("/api", api);

console.log("Listening on http://localhost:8000");
Deno.serve(app.fetch);
