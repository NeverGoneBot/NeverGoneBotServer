const express = require('express');
const router = express.Router();

const passwordHasher = require('password-hash');

const mongoose = require('mongoose');
const User = require('../models/User.js');

router.get('/', function(req, res, next) {
    User.find(function(err, users) {
        if (err) {
            return next(err);
        }

        res.json(users);
    });
});

router.post('/', function(req, res, next) {
    if (!("username" in req.body && "password" in req.body)) {
        // Status: 400, BAD REQUEST - Missing username and/or password parameter(s)
        res.status(400)
           .send({ error: 'Missing username and/or password fields' });
    } else if (!(req.body.username.length > 3 && req.body.password.length >= 8)) {
        res.status(400)
           .send({ error: 'Username must be atleast 3 characters and the password must be atleast 8 characters' });
    }
    else{


      const user = {
          username: req.body.username,
          passwordHash: passwordHasher.generate(req.body.password)
      };

      User.create(user, function(err, user) {
          if (err) {
              return next(err);
          }

          res.status(201).json(user);
      });

    }


});

router.post('/login', function(req,res,next){

  //handle missing information on client side

  var username = req.body.username;
  var password = req.body.password;

  User.findOne({'username' : username}, 'username passwordHash', function(err, user){

    if(err) return next(err);

    const hash = user.passwordHash;

    const success = passwordHasher.verify(password, hash);
    const statusCode = success ? 200 : 401;
    var response = {
        status: success ? 'OK' : 'ERROR',
        message: success ? 'login successful' : 'wrong password!'
    };

    if (success) {
        response.userObj = user;
    } 

    res.status(statusCode).send(response);
  });


});

router.get('/:id', function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
        if (err) {
            return next(err);
        }

        res.json(user);
    });
});


router.put('/:id', function(req, res, next) {
    User.findByIdAndUpdate(req.params.id, req.body, function(err, user) {
        if (err) {
            return next(err);
        }

        res.json(user);
    });
});

module.exports = router;
