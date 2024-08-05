const express = require("express");
const mysql = require("mysql");
const app = express();

// Configuración de la base de datos
let conexion = mysql.createConnection({
    host: "localhost",
    database: "Libreria",
    user: "root",
    password: ""
});

conexion.connect(function(err) {
    if (err) {
        throw err;
    } else {
        console.log("Conexión exitosa");
    }
});

// Middleware para procesar datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Motor de plantillas EJS
app.set("view engine", "ejs");


// Ruta para renderizar el formulario
app.get("/", function(req, res) {
    res.render("registro");
});

// Ruta para procesar el formulario
app.post("/validar", function(req, res) {
    const datos = req.body;

    let nombre = datos.nombre;
    let apellido = datos.apellido;
    let fechaNac = datos.fechaNac;
    let titulo = datos.titulo;
    let fechaP = datos.fechaP;
    let precio = datos.Precio;

    // Iniciar una transacción
    conexion.beginTransaction(function(err) {
        if (err) {
            return res.status(500).send("Error al iniciar transacción");
        }

        // Inserción en la tabla autores
        let insertarAutor = 'INSERT INTO autores (Nombre, Apellido, Fecha_Nacimiento) VALUES (?, ?, ?)';
        conexion.query(insertarAutor, [nombre, apellido, fechaNac], function(error, resultadoAutor) {
            if (error) {
                return conexion.rollback(function() {
                    res.status(500).send("Error al insertar autor");
                });
            }

            // Obtener el ID del autor recién insertado
            let idAutor = resultadoAutor.insertId;

            // Inserción en la tabla libros
            let insertarLibro = 'INSERT INTO Libros (titulo, Fecha_Publicacion, Precio, id_Autores) VALUES (?, ?, ?, ?)';
            conexion.query(insertarLibro, [titulo, fechaP, precio, idAutor], function(error) {
                if (error) {
                    return conexion.rollback(function() {
                        res.status(500).send("Error al insertar libro");
                    });
                }

                // Confirmar la transacción
                conexion.commit(function(err) {
                    if (err) {
                        return conexion.rollback(function() {
                            res.status(500).send("Error al confirmar la transacción");
                        });
                    }
                    res.send("Datos almacenados correctamente");
                });
            });
        });
    });
});


// Ruta para actualizar autor
app.post("/actualizarAutor", function(req, res) {
    const datos = req.body;
    let idAutor = datos.idAutor;
    let nombre = datos.nombreActualizar;
    let apellido = datos.apellidoActualizar;
    let fechaNac = datos.fechaNacActualizar;

    // Corregimos el nombre de la tabla a 'Autores' y usamos 'id_Autores' como columna de identificación
    let actualizarAutor = 'UPDATE Autores SET Nombre = ?, Apellido = ?, Fecha_Nacimiento = ? WHERE id_Autores = ?';
    conexion.query(actualizarAutor, [nombre, apellido, fechaNac, idAutor], function(error, resultado) {
        if (error) {
            console.error("Error al actualizar autor:", error);
            return res.status(500).json({ error: "Error al actualizar autor", detalles: error.message });
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: "Autor no encontrado" });
        }
        res.json({ mensaje: "Autor actualizado correctamente" });
    });
});

// ... resto del código ...
// Ruta para actualizar libro
// Ruta para actualizar autor
app.post("/actualizarAutor", function(req, res) {
    const datos = req.body;
    let idAutor = datos.idAutor;
    let nombre = datos.nombreActualizar;
    let apellido = datos.apellidoActualizar;
    let fechaNac = datos.fechaNacActualizar;

    let actualizarAutor = 'UPDATE Autores SET Nombre = ?, Apellido = ?, Fecha_Nacimiento = ? WHERE id_Autores = ?';
    conexion.query(actualizarAutor, [nombre, apellido, fechaNac, idAutor], function(error, resultado) {
        if (error) {
            console.error("Error al actualizar autor:", error);
            return res.status(500).json({ error: "Error al actualizar autor", detalles: error.message });
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: "Autor no encontrado" });
        }
        res.json({ mensaje: "Autor actualizado correctamente" });
    });
});
// ... resto del código existente ...

// Ruta para actualizar libro
app.post("/actualizarLibro", function(req, res) {
    const datos = req.body;
    let idLibro = datos.idLibro;
    let titulo = datos.tituloActualizar;
    let fechaP = datos.fechaPActualizar;
    let precio = datos.precioActualizar;

    // Cambiamos 'id_Libros' por 'id_Libro' (o el nombre correcto de la columna en tu base de datos)
    let actualizarLibro = 'UPDATE Libros SET titulo = ?, Fecha_Publicacion = ?, Precio = ? WHERE id_Libro = ?';
    conexion.query(actualizarLibro, [titulo, fechaP, precio, idLibro], function(error, resultado) {
        if (error) {
            console.error("Error al actualizar libro:", error);
            return res.status(500).json({ error: "Error al actualizar libro", detalles: error.message });
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: "Libro no encontrado" });
        }
        res.json({ mensaje: "Libro actualizado correctamente" });
    });
});





// ... código existente ...

// Ruta para eliminar autor
app.post("/eliminarAutor", function(req, res) {
    const idAutor = req.body.idAutorEliminar;

    // Primero, eliminamos los libros asociados al autor
    let eliminarLibros = 'DELETE FROM Libros WHERE id_Autores = ?';
    conexion.query(eliminarLibros, [idAutor], function(error, resultadoLibros) {
        if (error) {
            console.error("Error al eliminar libros del autor:", error);
            return res.status(500).json({ error: "Error al eliminar libros del autor", detalles: error.message });
        }

        // Luego, eliminamos el autor
        let eliminarAutor = 'DELETE FROM Autores WHERE id_Autores = ?';
        conexion.query(eliminarAutor, [idAutor], function(error, resultadoAutor) {
            if (error) {
                console.error("Error al eliminar autor:", error);
                return res.status(500).json({ error: "Error al eliminar autor", detalles: error.message });
            }
            if (resultadoAutor.affectedRows === 0) {
                return res.status(404).json({ error: "Autor no encontrado" });
            }
            res.json({ mensaje: "Autor y sus libros eliminados correctamente" });
        });
    });
});

// Ruta para eliminar libro
app.post("/eliminarLibro", function(req, res) {
    const idLibro = req.body.idLibroEliminar;

    let eliminarLibro = 'DELETE FROM Libros WHERE id_Libro = ?';
    conexion.query(eliminarLibro, [idLibro], function(error, resultado) {
        if (error) {
            console.error("Error al eliminar libro:", error);
            return res.status(500).json({ error: "Error al eliminar libro", detalles: error.message });
        }
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: "Libro no encontrado" });
        }
        res.json({ mensaje: "Libro eliminado correctamente" });
    });
});

// ... resto del código existente ...







// Inicio del servidor
app.listen(3002, function() {
    console.log("Servidor creado http://localhost:3002");
});
