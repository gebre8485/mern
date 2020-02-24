const express = require('express');
const app = express();
const user = require('./api/user');
const profile = require('./api/profile');
const posts = require('./api/posts');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const db = require("./config/keys").dbUrl;
const passport = require("passport");


mongoose.connect(db, {useNewUrlParser: true})
    .then(console.log("mongodb connected"))
    .catch(error => console.log(error))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
    res.json({msg: "Hello world!"});
});

app.use("/user", user);
app.use("/profile", profile);
app.use("/posts", posts);
app.use(passport.initialize());
require("./config/passport")(passport);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => (console.log(`server listenning at port ${PORT}`)));