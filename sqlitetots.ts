import db from '@db/sqlite.ts'

let output = ''

// get all tables
const [{ names }] = db.sql<{ names: string[] }>`
    SELECT json_group_array(name) as names
    FROM sqlite_master
    WHERE type='table'`

for (const name of names.filter((name) => name !== 'sqlite_sequence')) {
    const t = db.prepare('pragma table_info(' + name + ')').all()
    output += `${output.length ? '\n' : ''}export type ${snakeToCamel('db_' + name)} = {\n`
    for (const column of t) {
        output += `    '${column.name}': ${sqliteTypeToTsType(column.type)}${
            column.notnull || column.pk ? '' : ' | null'
        }\n`
    }
    output += '}\n'
    console.log('generated interface for table ' + name)
}

Deno.writeFile('./src/db/sqlite.types.ts', new TextEncoder().encode(output), { create: true })

function sqliteTypeToTsType(type: string) {
    return {
        TEXT: 'string',
        INTEGER: 'number',
        REAL: 'number',
        BLOB: 'Buffer',
        NULL: 'null',
        DATETIME: 'string',
    }[type] ?? 'unknown'
}

function snakeToCamel(str: string) {
    return str.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''))
}
