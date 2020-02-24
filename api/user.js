const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require("bcryptjs")
const gravatar = require("gravatar");
const jwt = require('jsonwebtoken');
const keys = require("../config/keys");
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");
const passport = require("passport");
router.post("/registeration", (req, res) => {
    const {errors, isValid} = validateRegisterInput(req.body);
    if (!isValid){
        res.json(errors);
    }
    else{
    let email = req.body.email;
    User.findOne({email}).then(user => {
        if (user) res.json({success: false, msg: "user already exists."})
        else {
            
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar: req.body.avatar,
                password: req.body.password
            });
            const avatar = gravatar.url(req.body.email, {
                s: '200', // Size
                r: 'pg', // Rating
                d: 'mm' // Default
              });        
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                  if (err) throw err;
                  newUser.password = hash;
                  newUser.avatar = avatar;
                  newUser
                    .save()
                    .then(user => res.json(user))
                    .catch(err => console.log(err));
                });
              });
        }
    })   
}})
router.post("/login", (req, res) => {
  const {errors, isValid} = validateLoginInput(req.body);
    if (!isValid){
        res.json(errors);
    }
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email}).then(user =>{
        if (!user){ res.json({success: false, msg: "username incorrect!"})}
        else{
            bcrypt.compare(password, user.password).then(isMatch => {
                if (isMatch) {
                  // User Matched
                  const payload = { id: user.id, name: user.name, avatar: user.avatar }; // Create JWT Payload

                  jwt.sign(
                    payload,
                    keys.secretOrKey,
                    { expiresIn: 3600 },
                    (err, token) => {
                      res.json({
                        success: true,
                        token: 'Bearer ' + token
                      });
                    }
                  ); 
                } else {
                  return res.status(400).json("password incorrect.");
                }
              }).catch(error => res.json(error))
        }
    })
})

router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);
module.exports = router;