#!/bin/bash

# Obtener la lista de archivos dentro de la carpeta src/routes/
files=$(find src/routes -type f -name "*.ts")

# Ruta al archivo index.ts
index_file="src/index.ts"

# Verificar si el archivo index.ts existe
if [ -f "$index_file" ]; then
    # Obtener la línea después del comentario "// IMPORTANT: DON'T TOUCH THIS LINES"
    line_number=$(grep -n "// IMPORTANT: DON'T TOUCH THIS LINES" $index_file | cut -d ":" -f 1)
    
    # Verificar si se encontró la línea del comentario
    if [ -n "$line_number" ]; then
        # Eliminar todo el contenido debajo del comentario "// IMPORTANT: DON'T TOUCH THIS LINES"
        sed -i "${line_number}q" $index_file

        # Crear un nuevo contenido para el archivo index.ts
        new_content=""

        # Iterar sobre los archivos y agregar las importaciones y rutas
        for file in $files; do
            # Obtener el nombre del archivo sin la extensión
            file_name=$(basename -- "$file")
            file_name="${file_name%.*}"

            # Reemplazar ".routes" con "Api" en el nombre del archivo
            import_name="${file_name//.routes/}Api"

            # Eliminar el carácter "@" de los nombres de importación
            import_name="${import_name//@/}"
            # Eliminar el carácter ":" de los nombres de importación
            import_name="${import_name//:/}"
            
            # Formatear el nombre de importación
            api_name="${file#src/routes/}"
            api_name="${api_name%.routes.*}"

            # Crear la importación y la ruta
            import_line="import ${import_name} from './${file#src/}'"
            route_line="app.route('/${api_name}', ${import_name})"

            # Agregar las líneas al nuevo contenido
            new_content="${new_content}\n${import_line}\n${route_line}"
        done

        # Actualizar el archivo index.ts con las nuevas importaciones y rutas
        echo -e "$new_content" >> $index_file

        echo "Deno.serve(app.fetch)" >> $index_file

        echo "El archivo index.ts ha sido actualizado con las importaciones y rutas."
    else
        echo "No se encontró el comentario '// IMPORTANT: DON'T TOUCH THIS LINES' en el archivo index.ts."
    fi
else
    echo "El archivo index.ts no existe en el directorio actual."
fi

# Fin del script
