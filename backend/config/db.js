// db.js — Handles the MongoDB connection using Mongoose
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// MongoDB connection function
const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from .env
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`✅ [MongoDB] Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ [MongoDB Error] Connection Failed: ${error.message}`);
    process.exit(1); // Exit process if DB connection fails
  }
};

module.exports = connectDB;

