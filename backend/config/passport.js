const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { pool } = require('../db');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    const googleId = profile.id;
    const email = profile.emails[0].value;

    try {
      // 1. Check if user exists with this Google ID
      let userResult = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
      if (userResult.rows.length > 0) {
        return done(null, userResult.rows[0]);
      }

      // 2. If not, check if user exists with this email (they signed up locally before)
      userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userResult.rows.length > 0) {
        // 3. If so, link the Google ID to their existing account
        const updatedUserResult = await pool.query(
          'UPDATE users SET google_id = $1 WHERE email = $2 RETURNING *',
          [googleId, email]
        );
        return done(null, updatedUserResult.rows[0]);
      }

      // 4. If no user exists at all, create a new one
      const newUserResult = await pool.query(
        'INSERT INTO users (google_id, email, role) VALUES ($1, $2, $3) RETURNING *',
        [googleId, email, 'employee'] // Default role
      );
      
      return done(null, newUserResult.rows[0]);
    } catch (error) {
      return done(error, false);
    }
  }
));