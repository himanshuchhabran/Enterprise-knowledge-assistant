const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initDb } = require('./db');
const authRoutes = require('./routes/auth');
//const chatRoutes = require('./routes/chat'); // We will create this next

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
//app.use('/api/chat', chatRoutes);

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initDb();
});