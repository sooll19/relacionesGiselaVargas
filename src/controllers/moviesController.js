const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const moment = require('moment')
const { Op } = require("sequelize");


//Aqui tienen una forma de llamar a cada uno de los modelos
//const {Movies,Genres,Actor} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll()
            .then(movies => {
                res.render('moviesList.ejs', {movies})
            })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id,{
            include : ['genre']
        })
            .then(movie => {
                //return res.send(movie)
                res.render('moviesDetail.ejs', {movie});
            });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order : [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', {movies});
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: {[db.Sequelize.Op.gte] : 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', {movies});
            });
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    add: function (req, res) {
        db.Genre.findAll({
            order:['name']
        })
        .then(allGenres =>{
            return res.render("moviesAdd",{
                allGenres
            });
        })
        .catch((error) => console.log(error));
    },
    create: function (req,res) {
        const { title, rating, awards, release_date, length,genre_id } = req.body;
        db.Movie.create({
          title: title.trim(),
          rating,
          awards,
          release_date,
          length,
          genre_id
        })
          .then((movie) => {
            console.log(movie);
            return res.redirect("/movies");
          })
          .catch((error) => console.log(error));
    },
    edit: function(req,res) {
       const allGenres = db.Genre.findAll({
            order:['name']
        })
       const movie = db.Movie.findByPk(req.params.id)

       Promise.all([movie,allGenres])
        .then(([movie,allGenres]) => {
          return res.render("moviesEdit", {
            Movie: movie,
            moment,
            allGenres
          });
        })
        .catch((error) => console.log(error));
    },
    update: function (req,res) {
        const { title, rating, awards, release_date, length,genre_id } = req.body;
        db.Movie.update(
          {
            title: title.trim(),
            rating,
            awards,
            release_date,
            length,
            genre_id
          },
          {
            where: {
              id: req.params.id,
            },
          }
        )
          .then((response) => {
            console.log(response);
            db.Movie.findByPk(req.params.id).then((movie) => {
              return res.render("moviesDetail", {
                movie,
              });
            });
          })
          .catch((error) => console.log(error));
    },
    delete: function (req, res) {
      db.Movie.findByPk(req.params.id)
        .then((movie) => {
          return res.render("moviesDelete", {
            movie,
          });
        })
        .catch((error) => console.log(error));
    },
    destroy: function (req, res) {
      
      db.ActorMovie.destroy({
        where: {
          movie_id: req.params.id,
        },
      })
      .then((response) =>{
        console.log('response ActorMovie =>', response);
        db.Actor.update(
          {
  favorite_movie_id : null
          },
          {
            where : {
  favorite_movie_id: req.params.id
            }
          }
        )
        .then((response) =>{
          console.log('response Actor =>', response);
          db.Movie.destroy({
            where: {
              id:req.params.id,
            },
          })
          .then((response) =>{
            console.log('response Movie =>', response);
            return res.redirect('/movies')
          })
        })
       
      })
    .catch((error) => console.log(error));
    }
  }

module.exports = moviesController;