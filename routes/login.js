var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;
var app = express();

var Usuario = require('../models/usuario');



// GOOGLE
const {
    OAuth2Client
} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload.sub;
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}
// =======================================
//  AUTENTICACIÓN GOOGLE
// =======================================
app.post('/google', async(request, response) => {

    var token = request.body.token;
    var googleUser = await verify(token).catch(e => {
        return response.status(403).json({
            ok: false,
            mensaje: 'TOKEN NO VALIDO!',

        });

    });

    Usuario.findOne({
        email: googleUser.email
    }, (error, usuarioDB) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: error
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticación normal',

                });
            } else {
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


            }

        } else {
            // El usuario no existe, hay que crearlo
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.password = ':)';
            usuario.img = googleUser.img;
            usuario.google = true;

            usuario.save((error, usuarioDB) => {
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

        }
    });
    // return response.status(200).json({
    //     ok: true,
    //     mensaje: 'BIEN!',
    //     googleUser: googleUser
    // });
});
// =======================================
//  AUTENTICACIÓN NORMAL
// =======================================
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