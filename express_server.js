var express = require('express');
var app = express();
var PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(cookieParser());


  app.set("view engine", "ejs");
  app.use(bodyParser.urlencoded({extended: true}));

 function generateRandomString(){
  var output = ""
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (var i = 0; i < 6; i++)
    output += possible.charAt(Math.floor(Math.random() * possible.length));

  return output;
}

   var urlDatabase = {
     "b2xVn2": "http://www.lighthouselabs.ca",
     "9sm5xK": "http://www.google.com"
   };

    //Allows person to login
    app.post("/urls/login", (req, res) => {
      res.cookie("username", req.body.username);
      res.redirect("/urls");
    });

    //Allows person to logout
    app.post("/urls/logout", (req, res) => {
      var submit = req.body.username;
      res.clearCookie("username", submit)
      res.redirect("/urls");
    })

    //Home Page: Displays Submitted URL Data
    app.get("/urls", (req, res) => {
      const templateVars = {
        urls: urlDatabase,
        username: req.cookies["username"]
      };
      res.render("urls_index", templateVars);
   });

  //Page to Create A New TinyURL
  app.get("/urls/new", (req, res) => {
    const templateVars = {
      username: req.cookies["username"]
    };
    res.render("urls_new", templateVars);
  });

  //Registration Page
  app.get("/urls/registration", (req, res) => {
    const templateVars = {
      username: req.cookies["username"]
    };
    res.render("urls_register", templateVars)
  });

  //Action when a new URL is Created
  //Posts the new URL on home page
  app.post("/urls", (req, res) => {
    var shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
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
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  });

  //Takes us to the individual page of a URL
  // Displays both the long and short URL
  app.get("/urls/:id", (req, res) => {
    const templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id],
      username: req.cookies["username"]
    };
    res.render("urls_show", templateVars);
   });

  //A page in which we can update and existing URL
  app.get("/urls/:id", (req, res) =>{
    const templateVars = {
      shortURL: req.params.id,
      username: req.cookies["username"]
    };
    res.render("urls_show", templateVars);
  });



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

