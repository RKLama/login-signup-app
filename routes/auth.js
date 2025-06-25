const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');

const router = express.Router();

// GET signup
router.get('/signup', (req, res) => {
  res.render('signup');
});

// POST signup
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
      [username, email, hashed]
    );
    res.redirect('/login');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// GET login
router.get('/login', (req, res) => {
  res.render('login');
});

// POST login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user.id;
      res.redirect('/dashboard');
    } else {
      res.send('Invalid credentials');
    }
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// Route Protection Middleware
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// GET dashboard
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
    const user = result.rows[0];
    res.render('dashboard', { user });
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// GET logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.send('Error logging out');
    }
    res.redirect('/login');
  });
});

module.exports = router;
