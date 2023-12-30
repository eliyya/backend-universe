import { Database, RestBindParameters } from '@sqlite/mod.ts'

const db = new Database('database.db')

db.sql`
-- Tabla 'registers'
CREATE TABLE IF NOT EXISTS registers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    user_id INTEGER NULL,
    UNIQUE(email),
    UNIQUE(user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabla 'users'
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    displayname TEXT NULL,
    avatar TEXT NULL,
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
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabla 'class_members'
CREATE TABLE IF NOT EXISTS class_members (
    class_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabla 'class_groups'
CREATE TABLE IF NOT EXISTS class_groups (
    class_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON UPDATE CASCADE ON DELETE CASCADE
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
