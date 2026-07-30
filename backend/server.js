const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');

// Initialize Express App
const app = express();

// Database Connection
connectDB();

// Middleware: Standard API body limit (1MB max for JSON/urlencoded payloads)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cors());

// Health Check Endpoint: Explicit distinction between Server Status & DB Connection
app.get('/api/health', (req, res) => {
    const dbStateMap = {
        0: 'Disconnected',
        1: 'Connected',
        2: 'Connecting',
        3: 'Disconnecting'
    };

    const isDbConnected = mongoose.connection.readyState === 1;
    const dbStatus = dbStateMap[mongoose.connection.readyState] || 'Unknown';

    res.status(isDbConnected ? 200 : 503).json({
        status: isDbConnected ? 'OK' : 'DEGRADED',
        success: isDbConnected,
        message: isDbConnected 
            ? 'Campus Issue Tracker API Server is running and connected to database'
            : 'Campus Issue Tracker API Server is running, but database connection is unavailable',
        database: dbStatus,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Authentication & Core Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 Handler for APIs
app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: 'API Route not found' });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('[Server Error]', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`===================================================`);
        console.log(`🚀 Campus Issue Tracker Backend running on port ${PORT}`);
        console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
        console.log(`===================================================`);
    });
}

module.exports = app;
