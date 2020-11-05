/** Controlador de la entidad Project encargada de guardar información en la colección projects
    de la base de datos **/
'use strict'

//Cargamos-importamos el modelo Project
var Project = require('../models/project');
//Importamos-cargamos la librería File System de NodeJS para tratar archivos
var fs = require('fs');
//Importamos el módulo de nodeJS que nos permite importar rutas de nuestro sistema de archivos
var path = require('path');


//Creamos el controlador en un objeto JSON directamente con todas las funciones o métodos. 
//También podríamos usar métodos separados que devuelvan un objeto JSON. 
var controller = {

    home: function(req, res) {
        return res.status(200).send({
            message: "Soy la home"
        });
    },

    test: function(req, res) {
        return res.status(200).send({
            message: "Soy el método o acción test del controlador project"
        });
    },

    //Método que guarda un elemento de proyecto en la base de datos
    saveProject: function(req, res) {
        let project = new Project();

        //recogemos los parámetros que nos llegan por el body(post) de la petición
        let params = req.body;
        //Asignamos los datos recibidos a cada una de las propiedades del objto project
        project.name = params.name;
        project.description = params.description;
        project.category = params.category;
        project.year = params.year;
        project.langs = params.langs;
        project.image = null;

        //Médoto que guarda un proyecto en la base de datos
        //Usamos el método .save de mongoose, el cuál está cargado en el esquema del modelo Project(/models/project.js)
        //Función de callback que devuelve un error o el objeto guardado(a projectStored podemos llamarlo proyecto guardado o como queramos)
        project.save((err, projectStored) => {
            //Si devuelve error
            if (err) return res.status(500).send({ message: 'Error al guardar el documento.' });
            //Si no existe el objeto projectStored
            if (!projectStored) return res.status(404).send({ message: 'No se ha podido guardar el proyecto' });
            //Si todo ha ido bien devolvemos el objeto guardado dentro de una propiedad project, si no indicamos la propiedad
            //devolvería el objeto dentro de una propiedad con el mismo nombre, es decir, projectStored
            return res.status(200).send({ project: projectStored });
        });
    },

    //Método que devuelve un documento de la base de datos según su id
    getProject: function(req, res) {
        let projectId = req.params.id;

        //Controlamos si se ha pasado el parámetro id por la ruta ya que lo hemos definido opcional
        if (projectId == null) {
            return res.status(404).send({ message: 'No has concretado el id del proyecto a consultar.' });
        }


        //Con el método .findById de mongoose recuperamos la información del proyecto a buscar
        Project.findById(projectId, (err, project) => {
            if (err) return res.status(500).send({ message: 'Error al devolver los datos, es posible que el formato del id no sea correcto' });

            if (!project) return res.status(404).send({ message: 'El proyecto con id=' + projectId + ' no existe.' });

            return res.status(200).send({
                project
            });
        });
    },

    //Método que devuelve todos los proyectos que hay en la colección projects de nuestra base de datos portafolio_bd
    getProjects: function(req, res) {

        //Usamos el método .find() de mongoose para conseguir todos los proyectos. Más información: https://mongoosejs.com/docs/api.html#model_Model.find
        Project.find({}).exec((err, projects) => {

            if (err) return res.status(500).send({ message: 'Error al devolver los datos' });

            if (!projects) return res.status(404).send({ message: 'No hay proyectos para mostrar' });
            //Si todo ha ido bien devolvemos un array de objetos JSON con todos los proyectos
            return res.status(200).send({ projects });
        });
    },

    //Método que actualiza un proyecto por su id recibida por como parámetro por la url
    updateProject: function(req, res) {

        let projectId = req.params.id;


        //Capturamos el body de la petición con todos los datos a actualizar
        let update = req.body;

        //Controlamos si se ha pasado el id del proyecto
        if (projectId == null) {
            return res.status(404).send({ message: 'No has concretado el id del proyecto a actualizar.' });
        }

        //Actualizamos el proyecto con la función .findByIdAndUpdate de mongoose. Con la opción {new:true}
        //nos devuelve el documento actualizado, si no nos devuelve el anterior
        Project.findByIdAndUpdate(projectId, update, { new: true, useFindAndModify: false }, (err, projectUpdated) => {

            if (err) return res.status(500).send({
                message: 'Error al actualizar el proyecto. Es posible que el formato id proporcionado del proyecto sea erróneo'
            });

            if (!projectUpdated) return res.status(404).send({ message: 'Error al actualizar el proyecto. Es posible que el proyecto no exista en la base de datos' });

            //En caso positivo devolvemos el proyecto actualizado en la propiedad project
            return res.status(200).send({
                project: projectUpdated
            });
        });

    },

    //Método que elimina un proyecto de la base de datos
    deleteProject: function(req, res) {
        //recogemos id del proyecto
        let projectId = req.params.id;

        //Controlamos si se ha pasado el id del proyecto
        if (projectId == null) {
            return res.status(404).send({ message: 'No has concretado el id del proyecto a borrar.' });
        }

        //La función .findByIdAndRemove de mongoose elimina un documento por su id.
        Project.findByIdAndRemove(projectId, (err, projectDeleted) => {

            if (err) return res.status(500).send({ message: 'Error al eliminar el proyecto. Es posible que el formato id proporcionado del proyecto sea erróneo' });

            if (!projectDeleted) return res.status(404).send({ message: 'Error al eliminar el proyecto. Es posible que el proyecto no exista en la base de datos' });

            //En caso positivo devolvemos el proyecto eliminado
            return res.status(200).send({
                project: projectDeleted
            });
        });
    },

    //Método que sube una imagen del proyecto a la base de datos
    uploadImage: function(req, res) {

        //Podemos recoger ficheros por la req porque instalamos previamente el módulo connect-multiparty de NodeJS
        if (req.files) {
            let projectId = req.params.id;
            let filePath = req.files.image.path;
            //capturamos el nombre del archivo de la ruta completa recibida
            let fileNameSplit = filePath.split('img/');
            let fileName = fileNameSplit[1];
            //capturamos la extension del archivo
            let extSplit = fileName.split('\.');
            let fileExt = extSplit[1];

            //Controlamos si se ha pasado el id del proyecto
            if (projectId == null) {

                //Si no se ha proporcionado id borramos la imagen de la carpeta ya que se sube automaticamente al ejecutar
                //la petición POST. Usanmos la función unlink() de la libreria fs de NodeJS
                fs.unlink(filePath, (err) => {
                    res.status(404).send({ message: "No has concretado el id del proyecto al cual quieres subir la imagen" });
                });

            } else {

                //Comprobamos que es una imagen
                if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif') {

                    //Actualizamos la propiedad image del proyecto para que el nombre coincida con el nombre de la imagen subida
                    Project.findByIdAndUpdate(projectId, { image: fileName }, { new: true }, (err, projectUpdated) => {

                        if (err) {

                            fs.unlink(filePath, (err) => {
                                if (err) res.status(500).send({ error: err });
                            });
                            return res.status(500).send({ message: "Error al subir la imagen. Es posible que el formato id proporcionado del proyecto sea erróneo" });
                        }

                        if (!projectUpdated) {
                            fs.unlink(filePath, (err) => {
                                if (err) res.status(404).send({ error: err });
                            });
                            return res.status(404).send({ message: "Error al subir la imagen, es posible que el proyecto no exista" });
                        }

                        return res.status(200).send({
                            project: projectUpdated
                        });

                    });

                } else {
                    //Si no es una imagen borramos el archivo ya que se guarda al ejecutar el método post
                    //usando el método .unlink() de la librería fs de NodeJS importada al principio del fichero
                    fs.unlink(filePath, (err) => {
                        res.status(200).send({ message: "La extensión no es válida" });
                    });
                }
            }

        }

    },

    //Método que recupera una imagen del proyecto(sólo una) para usarla al listar los
    //proyectos
    getImageProject: function(req, res) {
        //Nombre del archivo de imagen que recibiremos como parámetro
        let file = req.params.image;
        //ruta de la imagen
        let pathFile = './assets/uploads/img/' + file;

        //Usamos la librería fs importada arriba
        //Primero comprobamos si el archivo existe
        fs.exists(pathFile, (exists) => {
            if (exists) {
                //si existe devolvemos el archivo de la imagen
                //sendFile() es método de Express que devuelve un archivo.
                //path.resolve() es método de node que resuelve una ruta a ruta absoluta si no lo es
                return res.sendFile(path.resolve(pathFile));
            } else {
                return res.status(500).send({
                    message: "No existe la imagen..."
                });
            }
        });

    }
};


//exportamos nuestro módulo(controlador) para poder usarlo con un require('controller')
module.exports = controller;