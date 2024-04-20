#!/usr/bin/env -S deno run --allow-read --allow-write

import { walkSync } from 'https://deno.land/std@0.211.0/fs/mod.ts'

const indexFilePath = 'src/index.ts'
const comment = "// IMPORTANT: DON'T TOUCH THIS LINES"

if (!Deno.statSync(indexFilePath).isFile) {
    throw new Error('El archivo index.ts no existe en el directorio actual.')
}
const indexContent = await Deno.readTextFile(indexFilePath)
const lineIndex = indexContent.indexOf(comment)

if (lineIndex === -1) {
    throw new Error(`No se encontró el comentario '${comment}' en el archivo index.ts`)
}

let newContent = indexContent.substring(0, lineIndex + comment.length)

let ifile = 0
for (const file of [...walkSync('src/routes', { exts: ['ts'], includeDirs: false })].map((f) => f.path)) {
    newContent += `\nimport _${ifile} from './${file.replace('src/', '')}'\napp.route('/${
        file.replace('src/routes/', '').replace('.routes.ts', '')
    }', _${ifile++})`
}

newContent += '\n\nDeno.serve({\n    port:+(Deno.env.get(\'PORT\')||\'3001\')\n},app.fetch)'
await Deno.writeTextFile(indexFilePath, newContent)
console.log('El archivo index.ts ha sido actualizado con las importaciones y rutas.')
