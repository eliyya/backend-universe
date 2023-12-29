import { Database, RestBindParameters } from '@sqlite/mod.ts'

const db = new Database('database.db')

db.sql`
-- Tabla 'users'
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    username TEXT NOT NULL,
    displayname TEXT NULL,
    avatar TEXT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    UNIQUE(email),
    UNIQUE(username)
);

-- Tabla 'classes'
CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    teacher_id INTEGER NOT NULL,
    icon TEXT NULL,
    description TEXT NULL,
    member_ids TEXT NOT NULL,  -- En SQLite, se usa TEXT para almacenar un array (puede contener JSON o texto separado por comas)
    group_ids TEXT NOT NULL,   -- En SQLite, se usa TEXT para almacenar un array (puede contener JSON o texto separado por comas)
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);
`

export const sql = {
    db,
    get<T extends Record<string, unknown>>(
        strings: TemplateStringsArray,
        ...values: RestBindParameters
    ) {
        return db.prepare(strings.join('?')).get<T>(...values)
    },
    exec(strings: TemplateStringsArray, ...values: RestBindParameters) {
        return db.exec(strings.join('?'), ...values)
    },
    run(strings: TemplateStringsArray, ...values: RestBindParameters) {
        return db.prepare(strings.join('?')).run(...values)
    },
    // deno-lint-ignore no-explicit-any
    values<T extends unknown[] = any[]>(
        strings: TemplateStringsArray,
        ...values: RestBindParameters
    ) {
        return db.prepare(strings.join('?')).values<T>(...values)
    },
}

export default db
