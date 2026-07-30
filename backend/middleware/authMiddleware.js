const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (!process.env.JWT_SECRET) {
        console.error('[Auth Error] JWT_SECRET environment variable is missing.');
        return res.status(500).json({
            success: false,
            message: 'Server configuration error: JWT_SECRET environment variable is not configured.'
        });
    }

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'User account not found' });
            }
            if (!req.user.isActive) {
                return res.status(403).json({ success: false, message: 'User account is deactivated' });
            }
            next();
        } catch (error) {
            console.error('[Auth Middleware] Invalid token:', error.message);
            return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
        }
    } else {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }
};

module.exports = { protect };
