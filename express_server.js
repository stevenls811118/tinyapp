// Npm packages

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');

// Configuration

const app = express();
const port = 8080;
const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxys";

// Database

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "gvh5YR",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "gvh5Ys",
  },
  aX483J: {
    longURL: "https://www.facebook.com",
    userID: "gvh5YR",
  },
};

const users = {
  gvh5YR: { 
    id: 'gvh5YR', email: 'stevenls1118@msn.com', password: '1' 
  }
};

// Helper functions

// Generate 6 digits string for userID and shortURL
let generateRandomString = () => {
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

// Check for the registration has email enter and it is not exist email
let getUserByEmail = (str) => {
  for (let i of Object.values(users)) {
    if (i.email === str) {
      console.log('email is already exist');
      return false;
    }
  }
  if (str === '') {
    console.log("please enter email");
    return false;
  }
  return true;
};

// Check email and password from users
let checkForLogin = (email, pass) => {
  for (let i of Object.values(users)) {
    if (i.email === email && i.password === pass) {
      return i.id;
    }
    return false;
  }
};

// Returns the URLs where the userID is equal to the id of the currently logged-in user
let urlsForUser = (id) => {
  let result = {};
  for (let i in urlDatabase) {
    if (id === urlDatabase[i].userID) {
      result[i] = urlDatabase[i];
    }
  }
  return result;
};

// Middleware
app.use(cookieParser()); // Help with cookies!
app.use(bodyParser.urlencoded({extended: true})); // Gather form submission data.
app.use(morgan('dev')); // Helpful logging, showing method, path, and status codes.

// Template Engine
app.set('view engine', 'ejs');

// Listener
app.listen(port, () => {
  console.log(`Tinyapp is listening on port ${port}.`);
});

// Routes

// App index page for urls
app.get('/urls', (req, res) => {
  if(!req.cookies.userID) {
    return res.send('Please login or register!');
  };
  let userID = req.cookies.userID;
  let filterUrlDataBase = urlsForUser(userID);
  let templateVars = {
    urls: filterUrlDataBase,
    users: users,
    userID: userID
  };
  res.render('urls_index', templateVars);
});

// Post create new url
app.post("/urls", (req, res) => {
  if(!req.cookies.userID) {
    return res.send('Login first!');
  }
  console.log(req.body);
  let shortURl = generateRandomString();
  urlDatabase[shortURl] = {};
  urlDatabase[shortURl].longURL = req.body.longURL;
  urlDatabase[shortURl].userID = req.cookies.userID;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURl}`);
});

// Display create new url page
app.get('/urls/new', (req, res) => {
  if(!req.cookies.userID) {
    return res.redirect('/login');
  };
  let userID = req.cookies.userID;
  const templateVars = {
    users: users,
    userID: userID
  };
  res.render('urls_new', templateVars);
});

// Display edit existing short url page 
app.get('/urls/:id', (req, res) => {
  if (!req.cookies.userID) {
    return res.send('Please login or register to see this page.');
  };
  let userID = req.cookies.userID;
  if (userID !== urlDatabase[req.params.id].userID) {
    return res.send(`You don't have access to this URL page.`);
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]["longURL"],
    users: users,
    userID: userID
  };
  res.render('urls_show', templateVars);
});

// Post edit existing short url request
app.post('/urls/:id', (req, res) => {
  if (!req.cookies.userID) {
    return res.send('Please login or register to see this page.');
  };
  let userID = req.cookies.userID;
  if (userID !== urlDatabase[req.params.id].userID) {
    return res.send(`You don't have access to this page.`);
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  urlDatabase[req.params.id].userID = req.cookies.userID
  console.log(urlDatabase);
  res.redirect('/urls');
});

// Post delete existing short url request
app.post('/urls/:id/delete', (req, res) => {
  if (!req.cookies.userID) {
    return res.send('Please login or register to see this page.');
  };
  let userID = req.cookies.userID;
  if (userID !== urlDatabase[req.params.id].userID) {
    return res.send(`You don't have access to this page.`);
  }
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// Display short url linked website
app.get('/u/:id', (req, res) => {
  if (Object.keys(urlDatabase).includes(req.params.id)) {
    let longURL = urlDatabase[req.params.id].longURL;
    return res.redirect(longURL);
  }
  res.send(`This shortened url ${req.params.id} that dose not exist!`);
});

// Display the login page.
app.get('/login', (req, res) => {
  if(req.cookies.userID) {
    return res.redirect('/urls');
  };
  let userID = req.cookies.userID;
  let templateVars = {
    urls: urlDatabase,
    users: users,
    userID: userID
  };
  res.render('login', templateVars);
});

// Post login form request
app.post('/login', (req, res) => {
  console.log('This is req.body: ', req.body);
  const email = req.body.email;
  const pass = req.body.password;
  if(checkForLogin(email, pass)) {
    res.cookie('userID', checkForLogin(email, pass));
    return res.redirect('/urls');
  };
  res.redirect(403, '/login');
});

// Post logout form request
app.post("/logout", (req, res) => {
  res.clearCookie('userID');
  res.redirect(`/login`);
});

// Display the register page
app.get("/register", (req, res) => {
  if(req.cookies.userID) {
    return res.redirect('/urls');
  };
  let userID = req.cookies.userID;
  let templateVars = {
    urls: urlDatabase,
    users: users,
    userID: userID
  };
  res.render('register', templateVars);
});

// Post the register form request
app.post("/register", (req, res) => {
  console.log(req.body);
  if (!getUserByEmail(req.body.email)) {
    res.redirect(400,'/register');
  } else {
    let id = generateRandomString();
    let email = req.body.email;
    let password = req.body.password;
    users[id] = {
      "id": id,
      "email": email,
      "password": password
    };
    res.cookie('userID', id);
    console.log(users);
    res.redirect('/urls');
  }
});

