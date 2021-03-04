require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const ejs = require("ejs");
const {
  Db
} = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;
app.use(express.static("public"));
app.use(express.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

///Connect to Database .userDB///
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.set("useCreateIndex", true);

///Create mongoose Schema///
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

//Create mongoose Model 
const User = new mongoose.model("User", userSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

///Routes
app.get("/", (req, res) => {
  res.render(("home"));
})

app.get("/login", (req, res) => {
  res.render(("login"));
})

app.get("/register", (req, res) => {
  res.render(("register"));
})

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets")
  } else {
    res.redirect("/login");
  }
})

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
})

app.post("/register", (req, res) => {
  User.register({
    username: req.body.username
  }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      })
    }
  })
});

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  })

  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      })
    }
  })
});





app.listen(port, () =>
  console.log(`Server started at port: ${port}`));