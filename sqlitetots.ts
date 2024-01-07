import db from '@db/sqlite.ts'

let output = ''

// get all tables
const [{ names }] = db.sql<{ names: string[] }>`
    SELECT json_group_array(name) as names
    FROM sqlite_master
    WHERE type='table'
    ORDER BY name`

for (const name of names.filter((name) => name !== 'sqlite_sequence')) {
    const t = db.prepare('pragma table_info(' + name + ')').all()
    output += 'export interface ' + snakeToCamel('db_' + name) + ' {\n'
    for (const column of t) {
        output += "    '" + column.name + "'" +
            (column.notnull ? '' : '?') + ': ' + sqliteTypeToTsType(column.type) + (column.notnull ? '' : ' | null') +
            '\n'
    }
    output += '}\n\n'
    console.log('generated interface for table ' + name)
}

Deno.writeFile('./src/db/sqlite.types.ts', new TextEncoder().encode(output), { create: true })

function sqliteTypeToTsType(type: string) {
    switch (type) {
        case 'TEXT':
            return 'string'
        case 'INTEGER':
            return 'number'
        case 'REAL':
            return 'number'
        case 'BLOB':
            return 'Buffer'
        case 'NULL':
            return 'null'
        case 'DATETIME':
            return 'string'
        default:
            return 'any'
    }
}

function snakeToCamel(str: string) {
    const p = str.split('_')
    let camelCase = p[0]
    for (let i = 1; i < p.length; i++) {
        camelCase += p[i][0].toUpperCase() + p[i].slice(1)
    }
    return camelCase
}
