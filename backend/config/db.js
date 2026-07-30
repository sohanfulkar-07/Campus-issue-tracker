const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_issue_tracker';
        const conn = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000 // Fast fail in 5s if DB unavailable
        });
        console.log(`[MongoDB] Connected successfully to ${conn.connection.host}/${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.warn(`[MongoDB Notice] Database connection unavailable (${error.message}). Set MONGODB_URI in backend/.env to connect MongoDB Atlas or local MongoDB.`);
        return null;
    }
};

module.exports = connectDB;
