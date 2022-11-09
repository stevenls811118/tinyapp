// Npm packages

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');

// Configuration

const app = express();
const port = 8080;

// Database

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "DdsdWk",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "DdsdWk",
  },
  aX483J: {
    longURL: "https://www.facebook.com",
    userID: "DdsdWk",
  },
};

const users = {
  DdsdWk: {
    id: 'DdsdWk', email: 'stevenls1118@msn.com', password: '$2a$10$nK87gSUzu6Xae7lKjXrnXOLOimjY0cm3ER1IpGid2GBWA1GJjvPRy'
  }
};

// Helper functions

const {generateRandomString, getUserByEmail, checkForLogin, urlsForUser} = require('./helpers');

// Middleware

app.use(bodyParser.urlencoded({extended: true})); // Gather form submission data.
app.use(morgan('dev')); // Helpful logging, showing method, path, and status codes.
app.use(cookieSession({ // Use cookieSession to encrypt cookie!
  name: 'session',
  keys: ['my secret key'],
}));

// Template Engine

app.set('view engine', 'ejs');

// Routes

// App index page for urls
app.get('/urls', (req, res) => {
  if (!req.session.userID) {
    return res.status(403).send('Please login or register!');
  }
  let userID = req.session.userID;
  let filterUrlDataBase = urlsForUser(userID, urlDatabase);
  let templateVars = {
    urls: filterUrlDataBase,
    users: users,
    userID: userID
  };
  res.render('urls_index', templateVars);
});

// Post create new url
app.post("/urls", (req, res) => {
  if (!req.session.userID) {
    return res.status(403).send('Login first!');
  }
  let shortURl = generateRandomString();
  urlDatabase[shortURl] = {};
  urlDatabase[shortURl].longURL = req.body.longURL;
  urlDatabase[shortURl].userID = req.session.userID;
  res.redirect(`/urls/${shortURl}`);
});

// Display create new url page
app.get('/urls/new', (req, res) => {
  if (!req.session.userID) {
    return res.redirect('/login');
  }
  let userID = req.session.userID;
  const templateVars = {
    users: users,
    userID: userID
  };
  res.render('urls_new', templateVars);
});

// Display edit existing short url page
app.get('/urls/:id', (req, res) => {
  if (!req.session.userID) {
    return res.status(403).send('Please login or register to see this page.');
  }
  let userID = req.session.userID;
  if (userID !== urlDatabase[req.params.id].userID) {
    return res.status(403).send(`You don't have access to this URL page.`);
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
  if (!req.session.userID) {
    return res.status(403).send('Please login or register to see this page.');
  }
  let userID = req.session.userID;
  if (userID !== urlDatabase[req.params.id].userID) {
    return res.status(403).send(`You don't have access to this page.`);
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  urlDatabase[req.params.id].userID = req.session.userID;
  res.redirect('/urls');
});

// Post delete existing short url request
app.post('/urls/:id/delete', (req, res) => {
  if (!req.session.userID) {
    return res.status(403).send('Please login or register to see this page.');
  }
  let userID = req.session.userID;
  if (userID !== urlDatabase[req.params.id].userID) {
    return res.status(403).send(`You don't have access to this page.`);
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
  res.status(403).send(`This shortened url ${req.params.id} that dose not exist!`);
});

// Display the login page.
app.get('/login', (req, res) => {
  if (req.session.userID) {
    return res.redirect('/urls');
  }
  let userID = req.session.userID;
  let templateVars = {
    urls: urlDatabase,
    users: users,
    userID: userID
  };
  res.render('login', templateVars);
});

// Post login form request
app.post('/login', (req, res) => {
  const email = req.body.email;
  const pass = req.body.password;
  if (checkForLogin(email, pass, users)) {
    req.session.userID = checkForLogin(email, pass, users);
    return res.redirect('/urls');
  }
  res.redirect('/login_error');
});

// Login error page
app.get('/login_error', (req, res) => {
  if (req.session.userID) {
    return res.redirect('/urls');
  }
  let userID = req.session.userID;
  let templateVars = {
    urls: urlDatabase,
    users: users,
    userID: userID
  };
  res.render('login_error', templateVars);
});

// Post logout form request
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

// Display the register page
app.get("/register", (req, res) => {
  if (req.session.userID) {
    return res.redirect('/urls');
  }
  let userID = req.session.userID;
  let templateVars = {
    urls: urlDatabase,
    users: users,
    userID: userID
  };
  res.render('register', templateVars);
});

// Display the register error for missing email or password
app.get("/register_error1", (req, res) => {
  if (req.session.userID) {
    return res.redirect('/urls');
  }
  let userID = req.session.userID;
  let templateVars = {
    urls: urlDatabase,
    users: users,
    userID: userID
  };
  res.render('missingEmailOrPass', templateVars);
});

// Display the register error for duplicated email
app.get("/register_error2", (req, res) => {
  if (req.session.userID) {
    return res.redirect('/urls');
  }
  let userID = req.session.userID;
  let templateVars = {
    urls: urlDatabase,
    users: users,
    userID: userID
  };
  res.render('emailDuplicated', templateVars);
});

// Post the register form request
app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.redirect('/register_error1');
  } else if (getUserByEmail(req.body.email, users)) {
    return res.redirect('/register_error2');
  } else {
    let id = generateRandomString();
    let email = req.body.email;
    let password = req.body.password;
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(password, salt);
    users[id] = {
      "id": id,
      "email": email,
      "password": hash
    };
    req.session.userID = id;
    res.redirect('/urls');
  }
});

// Listener

app.listen(port, () => {
  console.log(`Tinyapp is listening on port ${port}.`);
});
