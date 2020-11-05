'use strict'

//Cargamos el módulo express necesario para la creación del servidor Express en index.js
var express = require('express');
const path = require('path');
//Cargamos el módulo body-parser, necesario para convertir los objetos que nos lleguen por
//las cabeceras de las peticiones a JSON y poder trabajar con los datos.
var bodyParser = require('body-parser');

var app = express();

//** Cargamos archivos de configuración de Rutas de nuestros controladores
//Cargamos archivo de rutas de de la entidad Project en el objeto projectRoutes
var projectRoutes = require('./routes/project');


//** Middlewares - Se ejecuta antes de ejecutar el resultado de una petición
//Middleware necesario para configurar el objeto bodyParser
app.use(bodyParser.urlencoded({ extended: false }));
//Middleware que convierte a JSON los datos recibidos de cualquier tipo de petición
app.use(bodyParser.json());


//** Middleware para Configurar CABEZERAS y CORS
/* Siempre se ejecutará antes de cada petición.
   Nos configura las cabezeras.
   Y pasa a la ejecución de lo siguiente, que será cargar las rutas
   Con esto evitamos problemas cuando trabajemos con el manejo de peticiones desde el fron-end, permitiendo
   el acceso de un origen a otro, de un dominio a otro.
   Cuando vayamos a publicar nuestra aplicación en la (línea 34) en vez de poner '*' tendríamos que poner
   la url permitida o los orígenes permitidos. -res.header('Access-Control-Allow-Origin', '*');
*/
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// Middleware que especifica ruta estática para carpeta client en producción
app.use('/', express.static('client', { redirect: false }));
// Añadimos middleware con las Rutas de los archivos de rutas cargados al objeto app
//Añadimos las rutas de la entidad Project, añadiendole el segmento '/api' delante. Ej: /api/home para
//acceder al método home del controlador /controllers/project.js
app.use('/api', projectRoutes);

app.get('/assets/img', function(req, res, next) {
    //  res.writeHead(200,{'content-type':'image/jpg'});
    res.sendFile(path.join(__dirname + '/client/assets/img'));
    // fs.createReadStream(__dirname + '/public/images/miImagen.jpg').pipe(res);
});
//Middleware URL AMIGABLES
//Cuando cargue cualquier ruta que no sea '/' ni '/api' se lanzará esta función
app.get('*', function(req, res, next) {
    //Cada vez que se cargue una ruta que no sea las anteriores va a cargar el archivo index.html dentro
    //de la carpeta client y cuando pase por ese fichero, automáticamente cogerá lo que tenga en la url
    //Por ejemplo, si tengo '/projects' y mostrará la página correcta. Se necesita 'redirect:false' en
    //el app.use('/', express.static('client', { redirect: false })); que declaramos antes
    //res.sendFile(path.resolve('client/index.html'));
    res.sendFile(path.join(__dirname + '/client/index.html'));
});


//** Exportar - Este archivo app.js es un modulo de NodeJS así que lo exportamos en el objeto
//	 app que es dónde hemos cargado toda la configuración necesaria para crear el servidor Express
module.exports = app;