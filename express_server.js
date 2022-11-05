const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const port = 8080;
const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxys";

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

// generate 6 digits string for userID and shortURL
let generateRandomString = () => {
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

// check for the registration has email enter and it is not exist email
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

let checkForLogin = (email, pass) => {
  for (let i of Object.values(users)) {
    if (i.email === email && i.password === pass) {
      return i.id;
    }
    return false;
  }
}
const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.listen(port, () => {
  console.log(`Tinyapp is listening on port ${port}.`);
});

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls', (req, res) => {
  let userID = req.cookies.userID;
  let templateVars = {
    urls: urlDatabase,
    users: users,
    userID: userID
  };
  res.render('urls_index', templateVars);
});

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

app.get('/urls/:id', (req, res) => {
  let userID = req.cookies.userID;
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    users: users,
    userID: userID
  };
  res.render('urls_show', templateVars);
});

app.post("/urls", (req, res) => {
  if(!req.cookies.userID) {
    return res.send('Login first!');
  }
  console.log(req.body);
  let shortURl = generateRandomString();
  urlDatabase[shortURl] = req.body.longURL;
  res.redirect(`/urls/${shortURl}`);
});

app.get('/u/:id', (req, res) => {
  if (Object.keys(urlDatabase).includes(req.params.id)) {
    let longURL = urlDatabase[req.params.id];
    return res.redirect(longURL);
  }
  res.send(`This shortened url ${req.params.id} that dose not exist!`);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
});

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

app.post("/logout", (req, res) => {
  res.clearCookie('userID');
  res.redirect(`/login`);
});

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