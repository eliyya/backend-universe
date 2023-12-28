import { Database } from "https://deno.land/x/sqlite3@0.9.1/mod.ts";

const db = new Database("database.db");

// await db.exec(`
// -- Tabla 'users'
// CREATE TABLE IF NOT EXISTS users (
//     id TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-a' || substr('89ab',abs(random()) % 4 + 1,1) || '-' || lower(hex(randomblob(6)))),
//     created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
//     username TEXT NOT NULL,
//     displayname TEXT NULL,
//     email TEXT NOT NULL UNIQUE,
//     password TEXT NOT NULL,
//     avatar TEXT NULL
// );

// -- Tabla 'classes'
// CREATE TABLE IF NOT EXISTS classes (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
//     name TEXT NOT NULL DEFAULT '',
//     subject TEXT NOT NULL DEFAULT '',
//     teacher TEXT NOT NULL,
//     icon TEXT NOT NULL DEFAULT '',
//     description TEXT NULL,
//     FOREIGN KEY (teacher) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
// );`)

await db.exec(`
-- Tabla 'Usuarios'
CREATE TABLE IF NOT EXISTS Usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
);

-- Tabla 'Fotos Usuarios'

CREATE TABLE IF NOT EXIST fotos_usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL
    foto BLOB NOT NULL,
    direccion_img TEXT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla 'classes'
CREATE TABLE IF NOT EXISTS Publicacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    titulo text not null,
    descripcion text not null,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- insert
insert into Usuarios (id, nombre) values (1, 'perez');

-- update
update Usuarios set
    nombre = 'Perez Orta'
where id = 1;

-- Delete
delete from usuarios where id = 1
`);

export default db;
