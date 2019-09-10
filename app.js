// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
// Inicializar variables
var app = express();

// Body Parser
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

// Importa rutas

var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

// Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (error, response) => {
    if (error) {
        throw error;
    }
    console.log('Base de datos \x1b[32m%s\x1b[0m', 'online');
});

// Rutas
app.use('/', appRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);


// Escuchar peticiones
app.listen(3000, () => {
    return console.log('Express server en puerto 3000: \x1b[32m%s\x1b[0m', 'funcionando');
});