// index.js: Main server runner. Handles database connection and server listening.
const path = require('path');
const app = require('./server'); // Import the configured Express app
const connectDB = require('./config/db'); // Import the database connection function

// Load environment variables from .env file
// The path ensures it loads the .env file in the backend directory
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// ------------------------------------
// 1. Database Connection
// ------------------------------------
connectDB();

// ------------------------------------
// 2. Server Listener
// ------------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`));
