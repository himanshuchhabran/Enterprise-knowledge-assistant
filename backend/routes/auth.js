const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const router = express.Router();
const passport = require('passport');

// Register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if any users already exist
    const userCountResult = await pool.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(userCountResult.rows[0].count, 10);
    
    // Determine the role
    const role = userCount === 0 ? 'admin' : 'employee';
    
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, password_hash, role] 
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: 'User already exists or server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token,role: user.role  },);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login/failed' }),
  (req, res) => {
    // On successful authentication, req.user is populated.
    // We create a JWT for this user.
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Redirect the user back to the frontend with the token.
    // The frontend will then have to handle this.
    res.redirect(`${process.env.FRONTEND_URL}/?token=${token}&role=${req.user.role}`);
  }
);

module.exports = router;