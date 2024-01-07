import * as Sentry from '@sentry'
export { Sentry }

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

/**
 * @description log error and if is production send to sentry.io
 * @param {any} error
 * @returns {void}
 * @example captureException(new Error('test'))
 */
export function captureException(error: any): void {
    console.error(error)
    Sentry.captureException(error)
}

type PostgrestError = {
    message: string
    details: string
    hint: string
    code: string
}

export class SupabaseError extends Error {
    name = 'SupabaseError'

    constructor(err: PostgrestError) {
        super(err.message)
        this.cause = err.details
    }
}

export class DataBaseError extends Error {
    name = 'DataBaseError'

    constructor(err: string, details?: any) {
        super(err)
        this.cause = details
    }

    /**
     * @param {string} [u='Register']
     * @returns {DataBaseError} {u ?? 'Register'} not found
     * @example DataBaseError.NotFound('User')
     */
    static NotFound = (u = 'Register') => new DataBaseError(`${u} not found`)

    /**
     * @param {string} [u='Register']
     * @returns {DataBaseError} {u ?? 'Register'} already exists
     * @example DataBaseError.Duplicate('"user"')
     */
    static Duplicate = (u = 'Register') => new DataBaseError(`${u} already exists`)

    /**
     * @param {string} [u='Register']
     * @param {any} [details]
     * @returns {DataBaseError} Invalid {u ?? 'Register'}
     * @example DataBaseError.Invalid('email', { error: zodError })
     */
    static Invalid = (u = 'Register', details?: any): DataBaseError => new DataBaseError(`Invalid ${u}`, details)
}

export class AuthError extends Error {
    constructor(err: string) {
        super(err)
        this.name = 'AuthError'
    }

    /**
     * @param {string} [u='Register']
     * @returns {AuthError} Invalid {u ?? 'register'}
     * @example AuthError.Invalid('email or password')
     */
    static Invalid = (u = 'register') => new AuthError(`Invalid ${u}`)
}
