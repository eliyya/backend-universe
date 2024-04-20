addEventListener('unhandledrejection', (ev) => {
    console.error(ev)
})

addEventListener('error', (ev) => {
    console.error(ev)
})

/**
 * @description log error and if is production send to sentry.io
 * @param {any} error
 * @returns {void}
 * @example captureException(new Error('test'))
 */
export function captureException(error: any): void {
    console.error(error)
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
     * @returns {DataBaseError} {u ?? 'Register'} already exists
     * @example DataBaseError.Duplicate('"user"')
     */
    static Duplicate = (u = 'Register') => new DataBaseError(`${u} already exists`)
}

export class NotFoundError extends DataBaseError {
    name = 'NotFoundError'

    constructor(err = 'Register', details?: any) {
        super(err + ' not found')
        this.cause = details
    }
}

export class InvalidTypeError extends DataBaseError {
    name = 'InvalidTypeError'
    cause: unknown

    constructor(err = 'Some param', details: any) {
        super(err + ' type is invalid')
        this.cause = details
    }
}

export class DuplicateError extends DataBaseError {
    name = 'DuplicateError'

    constructor(err = 'Entry', details?: any) {
        super(err + ' already exists')
        this.cause = details
    }
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
