var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

app.post('/', (request, response) => {

    var body = request.body;

    Usuario.findOne({
        email: body.email
    }, (error, usuarioDB) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: error
            });
        }
        if (!usuarioDB) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: error
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - passwrd',
                errors: error
            });
        }
        // Quitamos la contraseña del token
        usuarioDB.password = ':)';
        var token = jwt.sign({
            usuario: usuarioDB
        }, SEED, {
            expiresIn: 14400
        });


        response.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });


    });

});


module.exports = app;