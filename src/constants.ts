export const TOKEN_TYPES = {
    Register: 'Register',
    Bearer: 'Bearer',
} as const

export type tTokenType = typeof TOKEN_TYPES[keyof typeof TOKEN_TYPES]
