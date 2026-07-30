const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
        console.error('[MongoDB Error] MONGODB_URI environment variable is not configured.');
        if (process.env.NODE_ENV === 'production') {
            console.error('[MongoDB Fatal Error] Exiting process: MONGODB_URI is required in production.');
            process.exit(1);
        } else {
            console.warn('[MongoDB Warning] Server running in development mode without MONGODB_URI configured. DB-dependent endpoints will return 503 until MONGODB_URI is set in backend/.env.');
            return null;
        }
    }

    try {
        const conn = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000 // Fast fail in 5s if DB is unavailable
        });
        console.log(`[MongoDB] Connected successfully to ${conn.connection.host}/${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.error(`[MongoDB Connection Error] Could not connect to database: ${error.message}`);
        
        if (process.env.NODE_ENV === 'production') {
            console.error('[MongoDB Fatal Error] Exiting process due to database connection failure in production.');
            process.exit(1);
        } else {
            console.warn('[MongoDB Warning] Database connection failed. DB-dependent endpoints will return 503 until database is accessible.');
            return null;
        }
    }
};

module.exports = connectDB;
