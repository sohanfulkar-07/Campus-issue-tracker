const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_issue_tracker';

    try {
        const conn = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000 // Fast fail in 5s if DB is unavailable
        });
        console.log(`[MongoDB] Connected successfully to ${conn.connection.host}/${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.error(`[MongoDB Connection Error] Could not connect to database: ${error.message}`);
        
        if (process.env.NODE_ENV === 'production') {
            console.error('[MongoDB Error] Exiting process due to database connection failure in production.');
            process.exit(1);
        } else {
            console.warn('[MongoDB Warning] Server running in development mode without active database connection. DB-dependent endpoints will return 503 until a valid MONGODB_URI is provided.');
            return null;
        }
    }
};

module.exports = connectDB;
