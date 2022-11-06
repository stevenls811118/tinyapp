const bcrypt = require('bcryptjs');

const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxys";
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
let getUserByEmail = (str, usersDatabase) => {
  for (let i of Object.values(usersDatabase)) {
    if (i.email === str) {
      return i.id;
    }
  }
  return;
};

// Check email and password from users
let checkForLogin = (email, pass, users) => {
  for (let i of Object.values(users)) {
    if (i.email === email && bcrypt.compareSync(pass, i.password)) {
      return i.id;
    }
  }
  return false;
};

// Returns the URLs where the userID is equal to the id of the currently logged-in user
let urlsForUser = (id, urlDatabase) => {
  let result = {};
  for (let i in urlDatabase) {
    if (id === urlDatabase[i].userID) {
      result[i] = urlDatabase[i];
    }
  }
  return result;
};

module.exports = {generateRandomString, getUserByEmail, checkForLogin, urlsForUser};