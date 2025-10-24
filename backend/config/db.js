const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Try MONGODB_URI first, then MONGO_URI as fallback
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        
        if (!uri) {
            throw new Error('MongoDB URI not found in environment variables');
        }

        const conn = await mongoose.connect(uri);
        console.log(`✅ [MongoDB] Database Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ [MongoDB] Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;