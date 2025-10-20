// server.js: Configures and exports the Express application instance
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit'); // ADD THIS

// Load environment variables (needed here for CORS config)
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();

// ------------------------------------
// 29. Setup morgan logger for request logging
// 'dev' format is concise and color-coded for development
app.use(morgan('dev'));

// ------------------------------------
// 25. Add helmet for security headers
// Standard set of security headers to prevent common attacks
app.use(helmet());

// ------------------------------------
// 26. Setup body-parser/express.json middleware
// Allows the app to parse JSON body content from incoming requests
app.use(express.json({ limit: '10mb' })); // ADD size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // ADD this line

// ------------------------------------
// 24. Configure CORS for development and production
const allowedOrigins = [process.env.CLIENT_URL]; // e.g., http://localhost:3000

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow cookies to be sent
};

app.use(cors(corsOptions));

// ------------------------------------
// ADD: Rate Limiting Middleware (Task 37)
// ------------------------------------
const guestRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per 15 minutes for guests
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Apply rate limiting to all API routes
app.use('/api/', guestRateLimiter);

// ------------------------------------
// 27. Create health check endpoint (/api/health)
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'up',
        timestamp: new Date().toISOString(),
        service: 'YouTube Analytics API',
    });
});

// ------------------------------------
// ADD: Authentication Routes (Tasks 31-40)
// ------------------------------------
const authRoutes = require('./routes/auth');
app.use('/api/v1/auth', authRoutes);

// ------------------------------------
// Future Routes will be placed here (e.g., app.use('/api/youtube', youtubeRoutes))
// ------------------------------------

// ------------------------------------
// 28. Implement Error Handling Middleware (Must be the last middleware)
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack to the console
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false, // ADD this for consistency
        message: err.message || 'An unexpected error occurred.',
        status: statusCode,
    });
});

module.exports = app;