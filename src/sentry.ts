import * as Sentry from "npm:@sentry/node";

if (Deno.env.get("SENTRY_DNS") && Deno.env.get("DENO_ENV") === "production") {
  Sentry.init({
    dsn: Deno.env.get("SENTRY_DNS"),
    integrations: [new Sentry.Integrations.Console()],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
}

addEventListener("unhandledrejection", (ev) => {
  console.error(ev);
  Sentry.captureException(ev);
});

addEventListener("error", (ev) => {
  console.error(ev);
  Sentry.captureException(ev);
});

export { Sentry };
