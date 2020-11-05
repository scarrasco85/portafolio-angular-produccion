'use strict'

/** Modelo Entidad project - referente a un documento dentro de la colección projects de MondoDB **/
//Cargamos mongoose: módulo que se encarga de trabajar con MongoDB y nodeJS
var mongoose = require('mongoose');
//Cargamos el objeto de Esquema para definir posteriormente el esquema del modelo 
var Schema = mongoose.Schema;

//Creamos el esquema del modelo project con el que trabajaremos para crear nuevos documentos
//dentro de nuestra colección projects de nuestra base de datos MongoDB
var ProjectSchema = Schema({
	name: String,
	description: String,
	category: String,
	year: Number,
	langs: String,
	image: String
});


//Exportamos el módulo Project para la colección de mongoDB 'projects'
module.exports = mongoose.model('Project', ProjectSchema);
// Project, el método .model de mongoose guarda los documents en la colección con el mismo nombre
//que se le pasa pero en minúscula y plural, es decir, los guardará en la colección 'projects'