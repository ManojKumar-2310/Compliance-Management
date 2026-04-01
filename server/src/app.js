const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow any localhost origin for development
        if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
            return callback(null, true);
        }

        // Allow specific origin
        if (origin === (process.env.CLIENT_URL || 'http://localhost:5173')) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging Middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Rate Limiting - Apply to all routes
app.use(apiLimiter);

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const regulationRoutes = require('./routes/regulationRoutes');
const taskRoutes = require('./routes/taskRoutes');
const documentRoutes = require('./routes/documentRoutes');
const auditRoutes = require('./routes/auditRoutes');
const riskRoutes = require('./routes/riskRoutes');

const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analytics');
const missionRoutes = require('./routes/missionRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

// Initialize Cron Jobs
const cronJobs = require('./utils/cronJobs');
cronJobs();

// API Routes
app.use('/api/auth', authLimiter, authRoutes); // Apply stricter rate limit to auth
app.use('/api/users', userRoutes);
app.use('/api/regulations', regulationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/mission', missionRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/departments', departmentRoutes);

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check Route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Compliance Management System API is running',
        version: '1.0.0',
        environment: process.env.NODE_ENV,
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.originalUrl,
    });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Error stack:', err.stack);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors,
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`,
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired',
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

module.exports = app;
