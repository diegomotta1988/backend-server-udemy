var express = require('express');

var app = express();

var fileUpload = require('express-fileupload');

// fileSystem
var fs = require('fs');

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


app.use(fileUpload());


// Rutas
app.put('/:tipo/:id', (request, response, next) => {
    var tipo = request.params.tipo;
    var id = request.params.id;

    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        response.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válida',
            errors: {
                message: 'Tipo de colección no válida'
            }
        });
    }


    if (!request.files) {
        response.status(400).json({
            ok: false,
            mensaje: 'No seleccionó',
            errors: {
                message: 'Debe seleccionar una imagen'
            }
        });
    }

    // Obtener nombre de archivo
    var archivo = request.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[nombreCortado.length - 1];

    // Solo aceptamos estas extensiones:
    var extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];
    if (extensionesValidas.indexOf(extension) < 0) {
        return response.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: {
                message: 'Las extensiones válidas son ' + extensionesValidas.join(', ')
            }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds()}.${ extension }`;

    // Mover el archivo a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, error => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: error
            });
        }


        subirPorTipo(tipo, id, nombreArchivo, response);
        // response.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',

        // });

    });
});

function subirPorTipo(tipo, id, nombreArchivo, response) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (error, usuario) => {

            if (!usuario) {

                return response.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: {
                        message: 'Usuario no existe'
                    }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;
            // Si existe, elimina la imagen anterior
            if (error) {
                return;
            }
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (error) => {
                    console.log(error);
                    return;
                });
            }

            usuario.img = nombreArchivo;

            usuario.save((error, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return response.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });

        });

    }

    if (tipo === 'medicos') {

        Medico.findById(id, (error, medico) => {

            if (!medico) {

                return response.status(400).json({
                    ok: false,
                    mensaje: 'Médico no existe',
                    errors: {
                        message: 'Médico no existe'
                    }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;
            // Si existe, elimina la imagen anterior
            if (error) {
                return;
            }
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (error) => {
                    console.log(error);
                    return;
                });
            }

            medico.img = nombreArchivo;
            medico.save((error, medicoActualizado) => {
                return response.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });

        });

    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (error, hospital) => {

            if (!hospital) {

                return response.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: {
                        message: 'Hospital no existe'
                    }
                });
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;

            if (error) {
                return;
            }
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (error) => {
                    console.log(error);
                    return;
                });
            }
            hospital.img = nombreArchivo;
            hospital.save((error, hospitalActualizado) => {
                return response.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });

        });

    }
}

module.exports = app;