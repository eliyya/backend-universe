export const TOKEN_TYPES = {
    Register: 'Register',
    Bearer: 'Bearer',
} as const

export type TokenType = typeof TOKEN_TYPES[keyof typeof TOKEN_TYPES]
