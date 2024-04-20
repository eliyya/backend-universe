import Snowflake from "@snowflake/mod.ts"

const snowflake = new Snowflake({
    epoch: new Date('2024-04-19'),
})

export function generateId() {
    return snowflake.generate()
}