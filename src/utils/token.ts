import { Jwt } from '@hono/utils/jwt/index.ts'
import { TokenType } from '@constants'

const secret = Deno.env.get('JWT_SECRET') as string

export async function decodeToken<expected>(token: string) {
    const payload = await Jwt.verify(token, secret)
    if (payload.expires as number < Date.now()) {
        throw new Error('Token expired')
    }
    return payload as expected & { expires: number; type: TokenType }
}

export async function generateToken(data: { [key: string]: unknown } & { type: TokenType }) {
    const expires = Date.now() + 60 * 60 * 24 * 1000
    const token = await Jwt.sign({ ...data, expires }, secret)
    return { token, expires, type: data.type }
}
