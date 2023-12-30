import { Jwt } from '@hono/utils/jwt/index.ts'
import { tTokenType } from '@constants'

const secret = Deno.env.get('JWT_SECRET') as string

export async function decodeToken<expected>(token: string) {
    try {
        const { payload } = await Jwt.verify(token, secret)
        if (payload.expires as number < Date.now()) {
            throw new Error('Token expired')
        }
        return payload as expected & { expires: number }
    } catch (error) {
        throw new Error(error.message)
    }
}

export async function generateToken(data: { [key: string]: unknown } & { type: tTokenType }) {
    const expires = Date.now() + 60 * 60 * 24
    const token = await Jwt.sign({ ...data, expires }, secret)
    return { token, expires, type: data.type }
}
