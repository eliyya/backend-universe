import { SignJWT, jwtVerify } from 'https://deno.land/x/jose@v4.14.4/index.ts'

const secret = new TextEncoder().encode(Deno.env.get('JWT_SECRET') as string)

export async function decodeToken<expected>(token: string) {
    try {
        const { payload } = await jwtVerify(token, secret)
        // @ts-ignore 
        if (payload.expires < Date.now()) throw new Error('Token expired')
        return payload as expected
    } catch (error) {
        throw new Error(error.message)
    }
}

export async function generateToken(data: { [key: string]: any }) {
    const expires = Date.now() + 60 * 60 * 24
    const token = await new SignJWT({ ...data, expires })
        .setProtectedHeader({ alg: 'HS256' })
        .sign(secret)
    return { token, expires }
}