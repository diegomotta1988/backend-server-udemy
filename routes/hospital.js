var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();

var Hospital = require('../models/hospital');


// Obtener todos los hospitales
app.get('/', (request, response, next) => {

    var desde = request.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(5)
        .exec(
            (error, hospitales) => {
                if (error) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: error
                    });
                }
                Hospital.count({}, (error, cuenta) => {
                    response.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: cuenta
                    });
                });
            });


});


// ================================================
// Crear un nuevo hospital
// ================================================
app.post('/', mdAutenticacion.verificaToken, (request, response) => {
    var body = request.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: request.usuario._id
    });

    hospital.save((error, hospitalGuardado) => {
        if (error) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: error
            });
        }

        response.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            hospitaltoken: request.hospital
        });

    });
});


// ================================================
// Actualizar hospital
// ================================================
app.put('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;


    Hospital.findById(id, (error, hospital) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: error
            });
        }
        if (!hospital) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe.',
                errors: {
                    message: 'No existe hospital con este id'
                }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = request.usuario._id;

        hospital.save((error, hospitalGuardado) => {
            if (error) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: error
                });
            }
            response.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });



    });


});


// ================================================
// Eliminar hospital por id
// ================================================
app.delete('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;

    Hospital.findByIdAndRemove(id, (error, hospitalBorrado) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: error
            });
        }
        if (!hospitalBorrado) {
            return response.status(500).json({
                ok: false,
                mensaje: 'No existe hospital con ese id',
                errors: 'No existe hospital con ese id'
            });
        }
        response.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });
});



module.exports = app;