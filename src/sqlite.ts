import { Database } from 'https://deno.land/x/sqlite3@0.9.1/mod.ts'

const db = new Database('database.db')

await db.exec(`
-- Tabla 'users'
CREATE TABLE IF NOT EXISTS users (
    id TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-a' || substr('89ab',abs(random()) % 4 + 1,1) || '-' || lower(hex(randomblob(6)))),
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    username TEXT NOT NULL,
    displayname TEXT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    avatar TEXT NULL
);

-- Tabla 'classes'
CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    name TEXT NOT NULL DEFAULT '',
    subject TEXT NOT NULL DEFAULT '',
    teacher TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '',
    description TEXT NULL,
    FOREIGN KEY (teacher) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
);`)

export default db