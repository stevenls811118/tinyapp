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

let generateRandomString = () => {
  let result = '';
  for(let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

let getUserByEmail = (str) => {
  for(let i of Object.values(users)) {
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

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.listen(port, () => {
  console.log(`Example app listening on port ${port}.`);
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
  let user_id = req.cookies.user_id;
  let templateVars = {
    urls: urlDatabase,
    users: users,
    user_id: user_id
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let user_id = req.cookies.user_id;
  const templateVars = { 
    users: users,
    user_id: user_id
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  let user_id = req.cookies.user_id;
  const templateVars = {
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    users: users,
    user_id: user_id
  };
  res.render('urls_show', templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let shortURl = generateRandomString();
  urlDatabase[shortURl] = req.body.longURL;
  res.redirect(`/urls/${shortURl}`);
});

app.get('/u/:id', (req, res) => {
  let longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
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
  console.log(req.body);
  const email = req.body.email;
  const pass = req.body.password;
  for(let i of Object.values(users)) {
    if (i.email === email && i.password === pass) {
      res.cookie('user_id', i.id);
      res.redirect('/urls')
    }
  }   
  res.redirect('/login');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls`);
});

app.get("/register", (req, res) => {
  res.render('register');
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
    res.cookie('user_id', id);
    console.log(users);
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});