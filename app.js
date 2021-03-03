require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
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


///Connect to Database .userDB///
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

///Create mongoose Schema///
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});



userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  //Only encrypt password
  encryptedFields: ['password']
});


//Create mongoose Model 
const User = new mongoose.model("User", userSchema);


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

app.post("/register", (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  })
  newUser.save((err) => {
    if (!err) {
      res.render("secrets");
    } else {
      console.log("There's an error" + err);
    }
  });
})

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  //Validate username and password
  User.findOne({
    email: username
  }, function (err, foundUser) {
    if (err) {
      console.log("There's an error somewhere..." + err);
    } else {
      if (foundUser) {
        if (foundUser.password == password) {
          console.log(foundUser.password);
          console.log("Succesfully Loged in");
          res.render("secrets")
        }
      }
    }
  })
});





app.listen(port, () =>
  console.log(`Server started at port: ${port}`));