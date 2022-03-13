var express = require("express");
var router = express.Router();
const { User, hashPassword } = require("../models/user");

var HandlerGenerator = require("../handlegenerator.js");
var middleware = require("../middleware.js");

HandlerGenerator = new HandlerGenerator();

/* GET users listing. */
router
  .get("/login", HandlerGenerator.login)
  .post("/signup", (req, res, next) => {
    User.findByPk(req.body.username).then((user) => {
      if (!user) {
        User.create({
          username: req.body.username,
          password: hashPassword(req.body.password),
          role: req.body.role,
        }).then((new_user) => {
          res.send(new_user);
        });
      } else {
        res.status(404).send("Ya hay un usuario con ese username");
      }
    });
  });

//Código adaptado de https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/

module.exports = router;
