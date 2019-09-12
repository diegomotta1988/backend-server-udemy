var express = require('express');

var app = express();

const path = require('path');
const fs = require('fs');

// Rutas
app.get('/:tipo/:img', (request, response, next) => {

    var tipo = request.params.tipo;
    var img = request.params.img;

    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);
    if (!fs.existsSync(pathImagen)) {
        pathImagen = path.resolve(__dirname, '../assets/no-img.jpg');
    }
    response.sendFile(pathImagen);

});

module.exports = app;