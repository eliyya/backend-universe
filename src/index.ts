import '@dotenv/load.ts'
import '@error'
import { Hono } from '@hono/mod.ts'
import { cors, logger } from '@hono/middleware.ts'
import { Sentry } from '@error'

if (!Deno.env.get('JWT_SECRET')) Deno.exit(1)

const app = new Hono()

app.use('*', cors())
app.use('*', logger())
app.onError((error, ctx) => {
    console.error(error)
    Sentry.captureException(error)
    return ctx.json({ message: 'Internal server error' }, 500)
})

async function getRoutes(
    path = Deno.cwd() + Deno.env.get('NODE_ENV') === 'production' ? '' : '/src' + '/routes',
    url = '/',
) {
    // declare routes object to return
    const routes: Record<string, Hono> = {}
    // if is file, import and add to routes
    for await (const route of Deno.readDir(path)) {
        if (route.isFile && route.name.includes('.routes.')) {
            const [routeName] = route.name.split('.')
            const { default: router } = await import(`${path}/${route.name}`)
            // add route to routes object
            routes[url + routeName] = router
        } else if (route.isDirectory) { // if is directory, recursively get routes
            const routeName = route.name.replace(/\.routes\..*$/, '')
            const subRoutes = await getRoutes(`${path}/${route.name}`, `${url}${routeName}/`)
            // add subroutes to routes object
            Object.assign(routes, subRoutes)
        }
    }
    // return routes object
    return routes
}
console.log(Deno.cwd())

for (const [url, router] of Object.entries(await getRoutes())) {
    app.route(url, router)
    console.log(`Route ${url} loaded`)
}

Deno.serve(app.fetch)
