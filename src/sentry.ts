import * as Sentry from '@sentry'

if (Deno.env.get('SENTRY_DNS') && Deno.env.get('NODE_ENV') === 'production') {
    Sentry.init({
        dsn: Deno.env.get('SENTRY_DNS'),
        integrations: [new Sentry.Integrations.Console()],
        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
    })
}

addEventListener('unhandledrejection', (ev) => {
    console.error(ev)
    Sentry.captureException(ev)
})

addEventListener('error', (ev) => {
    console.error(ev)
    Sentry.captureException(ev)
})

function captureException(error: any): void {
    console.error(error)
    Sentry.captureException(error)
}

export { captureException, Sentry }
