const express = require('express');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/auth');

require('dotenv').config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use('/', authRoutes);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
