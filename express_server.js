const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const port = 8080;
const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxys";

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let generateRandomString = () => {
  let result = '';
  for(let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
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
  let username = req.cookies.username;
  let templateVars = {
    urls: urlDatabase,
    username: username
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  let username = req.cookies.username;
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username: username
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
  console.log(req.body.username);
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect(`/urls`);
});