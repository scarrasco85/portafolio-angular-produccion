'use strict'

require('./server/config/config');

/** Conexión base de datos y Creación del servidor Express **/
//Cargamos el módulo de mongoose usando la función require() de NodeJS
var mongoose = require('mongoose');
//Cargamos el módulo de Express creado en el archivo app.js
var app = require('./app');


//Indicamos a mongoose que es una promesa
mongoose.Promise = global.Promise;
//Realizamos la conexión a la base de datos
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Conexión a la base de datos establecida satisfactoriamente...");

        //Creación del servidor - usamos el metodo listen() de Express
        app.listen(process.env.PORT, () => {
            console.log("Servidor corriendo correctamente en la url: localhost:3700");
        });
    })
    .catch(err => console.log(err));