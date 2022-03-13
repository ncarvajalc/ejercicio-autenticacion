var express = require("express");
var router = express.Router();

const Joi = require("joi");
const middleware = require("../middleware");

const Movie = require("../models/movie");

const schema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().min(3).required(),
});

/* GET movies listing. */
router.get("/", middleware.checkToken, function (req, res, next) {
  if (req.decoded.role === "reader") {
    Movie.findAll().then((movies) => {
      res.send(movies);
    });
  } else {
    res.status(401).send("No autorizado para leer");
  }
});

/* GET movie listing. */
router
  .get("/:id", middleware.checkToken, function (req, res, next) {
    if (req.decoded.role === "reader") {
      Movie.findByPk(req.params.id).then((movie) => {
        if (movie) res.send(movie);
        else {
          res.status(404).send("No hay una pelicula con ese id");
        }
      });
    } else {
      res.status(401).send("No autorizado para leer");
    }
  })
  .post("/", middleware.checkToken, function (req, res, next) {
    if (req.decoded.role === "writer") {
      const { error } = validate(req.body);
      if (error) {
        return res.status(400).send(error.details[0].message);
      }

      Movie.create({
        name: req.body.name,
        description: req.body.description,
      }).then((movie) => {
        res.send(movie);
      });
    } else {
      res.status(401).send("No autorizado para escribir");
    }
  })
  .put("/:id", middleware.checkToken, function (req, res, next) {
    if (req.decoded.role === "writer") {
      const { error } = validate(req.body);

      if (error) {
        return res.status(400).send(error.details[0].message);
      }
      Movie.update(req.body, { where: { id: req.params.id } }).then(
        (response) => {
          if (response[0] !== 0) {
            res.send("Movie updated");
          } else {
            res.status(404).send("No hay una pelicula con ese id");
          }
        }
      );
    } else {
      res.status(401).send("No autorizado para escribir");
    }
  })
  .delete("/:id", middleware.checkToken, function (req, res, next) {
    if (req.decoded.role === "writer") {
      Movie.destroy({ where: { id: req.params.id } }).then((result) => {
        if (result === 0) {
          res.status(404).send("No hay una pelicula con ese id");
        } else {
          res.status(204).send();
        }
      });
    } else {
      res.status(404).send("No hay una pelicula con ese id");
    }
  });

function validate(body) {
  return schema.validate(body);
}

module.exports = router;
