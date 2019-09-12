var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();
var Medico = require('../models/medico');


// Obtener todos los medicos
app.get('/', (request, response, next) => {

    var desde = request.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .skip(desde)
        .limit(5)
        .exec(
            (error, medicos) => {
                if (error) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: error
                    });
                }
                Medico.count({}, (error, cuenta) => {
                    response.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: cuenta
                    });
                });

            });


});


// ================================================
// Crear un nuevo medico
// ================================================
app.post('/', mdAutenticacion.verificaToken, (request, response) => {
    var body = request.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: request.usuario._id,
        hospital: body.hospital

    });

    medico.save((error, medicoGuardado) => {
        if (error) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: error
            });
        }

        response.status(201).json({
            ok: true,
            medico: medicoGuardado,
            medicotoken: request.medico
        });

    });
});


// ================================================
// Actualizar medico
// ================================================
app.put('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;


    Medico.findById(id, (error, medico) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: error
            });
        }
        if (!medico) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe.',
                errors: {
                    message: 'No existe medico con este id'
                }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = request.usuario._id;
        medico.hospital = body.hospital;

        medico.save((error, medicoGuardado) => {
            if (error) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: error
                });
            }
            response.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });



    });


});


// ================================================
// Eliminar medico por id
// ================================================
app.delete('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;

    Medico.findByIdAndRemove(id, (error, medicoBorrado) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: error
            });
        }
        if (!medicoBorrado) {
            return response.status(500).json({
                ok: false,
                mensaje: 'No existe medico con ese id',
                errors: 'No existe medico con ese id'
            });
        }
        response.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });
});



module.exports = app;