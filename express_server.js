var express = require('express');
var app = express();
var PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
app.use(cookieSession({
  name: 'session',
  keys: ['chilli donuts'],
  maxAge: 24 * 60 * 60 * 1000
}));

//Object used to store user information once they register
const users = {
  "user@example.com": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2@example.com": {
    id: "user2RandomID",
    email: "user2@exmaple.com",
    password: "dishwasher-funk"
  }
}

  app.set("view engine", "ejs");
  app.use(bodyParser.urlencoded({extended: true}));

 function generateRandomString(){
  var output = ""
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (var i = 0; i < 6; i++)
    output += characters.charAt(Math.floor(Math.random() * characters.length));

  return output;
}

function urlsForUser(id) {
  var output = {};
  for (var key in urlDatabase) {
    var URL = urlDatabase[key]
    if (id === URL.id) {
      output[key] = URL;
    }
  };
  return output
};


  var urlDatabase = {
     "b2xVn2": {
        id: "userRandomID",
        shortURL: "b2xVn2",
        longURL: "http://www.lighthouselabs.ca"
      },
    "9sm5xK": {
        id: "user2RandomID",
        shortURL: "9sm5xK",
        longURL: "http://www.google.com"
    }
  };

  //Registration Page
  app.get("/urls/registration", (req, res) => {
    const templateVars = {
      user_ID: req.session.id
    };
    res.render("urls_register", templateVars)
  });

  //Action when a new person registers
  app.post("/urls/registration", (req, res) => {
    var email = req.body.email
    var password = req.body.password
    var user_ID = generateRandomString();
    var hashed_password = bcrypt.hashSync(password, 10);
    var newUser = {
      id: user_ID,
      email: req.body.email,
      password: hashed_password
    }
    users[req.body.email] = newUser;

     if (email == false || password == false) {
        res.status(404).send('Registration Failed :(');
     } else {
    bcrypt.compareSync(req.body.password, hashed_password)
    req.session.id = newUser.id;
    console.log(users);
    res.redirect("/urls");
     }
  }),

  //Allows user to login
  app.get("/urls/login", (req, res) => {
      const templateVars = {
      user_ID: req.session.id
     };
      res.render("urls_login", templateVars);
    })

    //Allows person to login
    app.post("/urls/login", (req, res) => {
      var email = req.body.email
      var password = req.body.password

      if (!users[email] || email != users[email].email) {
         res.status(403).send('Login Failed :(');
      } else if (password != users[email].password) {
          res.status(403).send('Login Failed :(');
        } else {
      var id = users[email].id;
      req.session.id;
      res.redirect("/urls");
      }
    });

    //Allows person to logout
    app.post("/urls/logout", (req, res) => {
      req.session = null;
      res.redirect("/urls");
    })

    //Home Page: Displays Submitted URL Data
    app.get("/urls", (req, res) => {
      const id = req.session.id;
      const ownUserURLs = urlsForUser(id)
      const templateVars = {
        urls: ownUserURLs,
        user_ID: id
      };
      res.render("urls_index", templateVars);
   });

  //Page to Create A New TinyURL
  app.get("/urls/new", (req, res) => {
    const templateVars = {
      user_ID: req.session.id
    };
    res.render("urls_new", templateVars);
  });

  //Action when a new URL is Created
  //Posts the new URL on home page
  app.post("/urls", (req, res) => {
    const shortURL = generateRandomString();
    const urlObject = {
    id: req.session.id,
    shortURL: shortURL,
    longURL: req.body.longURL
  }
    urlDatabase[shortURL] = urlObject
    console.log(urlDatabase);
    res.redirect("/urls");
   });

  //The action that happens when a URL is updated
  //Redirects us back to the home page
  app.post("/urls/:id", (req, res) => {
    var updateURL = req.body.updateURL;
    longURL = updateURL
    urlDatabase[req.params.id] = updateURL;
    res.redirect("/urls");
  });

//Ability to delete existing URLs
  //Redirects us back to the home page
  app.post("/urls/:id/delete", (req, res) =>{
    const user_ID = req.session.id;
     if (user_ID != urlDatabase[req.params.id].id) {
      res.status(403).send('You Cannot Delete this URL :(');
         } else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
    }
  });

  //Takes us to the individual page of a URL
  // Displays both the long and short URL
  app.get("/urls/:id", (req, res) => {
    const templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id],
      user_ID: req.session.id
    };
    res.render("urls_show", templateVars);
   });

  //A page in which we can update and existing URL
  app.get("/urls/:id", (req, res) =>{
    const templateVars = {
      shortURL: req.params.id,
      user_ID: req.session.id
    };
    res.render("urls_show", templateVars);
  });

  //Redirects the user to website their shortURL is assigned with
  app.get("/u/:shortURL", (req, res) => {
   const longURL = urlDatabase[req.params.shortURL];
   res.redirect(longURL);
   });

   app.get("/urls.json", (req, res) => {
     res.json(urlDatabase);
   });

 app.listen(PORT, () => {
   console.log(`Example app listening on port ${PORT}!`);
 });

