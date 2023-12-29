import { encode } from '@encoding/hex.ts'
export async function hash(password: string, salt?: string) {
    const data = new TextEncoder().encode(password + salt ? `:${salt}` : '')
    const buffer = await crypto.subtle.digest('SHA-256', data)
    return new TextDecoder().decode(encode(new Uint8Array(buffer)))
}

export async function compare(password: string, hashed: string) {
    return await hash(password) === hashed
}
