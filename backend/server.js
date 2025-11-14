const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initDb } = require('./config/db');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const path = require('path'); 
const app = express();
const PORT = process.env.PORT || 3001;
const passport = require('passport');
require('./config/passport'); 

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL 
}));
app.use(express.json());
app.use(passport.initialize());
app.use('/data', express.static(path.join(__dirname, 'data')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.get('/', (req, res) => {
  res.send('Welcome! The server is running.');
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initDb();
});