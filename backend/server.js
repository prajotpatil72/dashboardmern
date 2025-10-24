// server.js: Configures and exports the Express application instance
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Load environment variables (needed here for CORS config)
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Import rate limiter from config
const { generalRateLimiter } = require('./config/rateLimit');

const app = express();

// ------------------------------------
// 29. Setup morgan logger for request logging
app.use(morgan('dev'));

// ------------------------------------
// 25. Add helmet for security headers
app.use(helmet());

// ------------------------------------
// 26. Setup body-parser/express.json middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ------------------------------------
// 24. Configure CORS for development and production
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000',
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ------------------------------------
// Task 37: General API Rate Limiting
// Using environment-based rate limiter (dev: unlimited, prod: 300/15min)
app.use('/api/', generalRateLimiter);

// ------------------------------------
// 27. Create health check endpoint (/api/health)
app.use('/api/health', (req, res) => {
    res.status(200).json({
        status: 'up',
        timestamp: new Date().toISOString(),
        service: 'YouTube Analytics API',
        environment: process.env.NODE_ENV || 'development',
        rateLimit: process.env.NODE_ENV === 'production' ? '300/15min' : 'unlimited'
    });
});

// ------------------------------------
// Authentication Routes
const authRoutes = require('./routes/auth');
app.use('/api/v1/auth', authRoutes);

// ------------------------------------
// YouTube Routes
const youtubeRoutes = require('./routes/youtube');
app.use('/api/v1/youtube', youtubeRoutes);

// ------------------------------------
// Cache Routes
const cacheRoutes = require('./routes/cache');
app.use('/api/v1/cache', cacheRoutes);

// ------------------------------------
// Error Handling
app.use((err, req, res, next) => {
    console.error('[Error]', err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// ------------------------------------
// Export app
module.exports = app;
