import {
    Database,
    RestBindParameters,
} from 'https://deno.land/x/sqlite3@0.9.1/mod.ts'

const db = new Database('database.db')

const sql = {
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
    values<T extends unknown[] = any[]>(
        strings: TemplateStringsArray,
        ...values: RestBindParameters
    ) {
        return db.prepare(strings.join('?')).values<T>(...values)
    },
}

sql.exec`
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
`

export default sql
