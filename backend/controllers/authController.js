const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is missing');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

const checkDbConnection = (res) => {
    if (mongoose.connection.readyState !== 1) {
        res.status(503).json({
            success: false,
            message: 'Database connection unavailable. Please set a valid MONGODB_URI (e.g. MongoDB Atlas or local MongoDB) in backend/.env.'
        });
        return false;
    }
    return true;
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    if (!checkDbConnection(res)) return;

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            success: false,
            message: 'Server configuration error: JWT_SECRET environment variable is not configured.'
        });
    }

    try {
        const { userId, password, role } = req.body;

        if (!userId || !password) {
            return res.status(400).json({ success: false, message: 'Please provide user ID/email and password' });
        }

        const user = await User.findOne({
            $or: [
                { userId: userId.trim() },
                { email: userId.trim().toLowerCase() }
            ]
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
        }

        if (role && user.role !== role && !(role === 'other' && user.role === 'admin')) {
            return res.status(401).json({ success: false, message: `Account is registered as ${user.role}, not ${role}.` });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact admin.' });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                rollNo: user.rollNo,
                employeeId: user.employeeId,
                designation: user.designation,
                phone: user.phone,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('[Login Error]', error);
        res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
    }
};

// @desc    Register a new student/user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    if (!checkDbConnection(res)) return;

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            success: false,
            message: 'Server configuration error: JWT_SECRET environment variable is not configured.'
        });
    }

    try {
        const { userId, name, email, password, role, department, phone, rollNo, employeeId, designation } = req.body;

        if (!userId || !name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const userExists = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { userId }]
        });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User with this ID or Email already exists' });
        }

        const user = await User.create({
            userId,
            name,
            email: email.toLowerCase(),
            password,
            role: role || 'student',
            department: department || 'General',
            phone: phone || '',
            rollNo: rollNo || '',
            employeeId: employeeId || '',
            designation: designation || ''
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                userId: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });
    } catch (error) {
        console.error('[Register Error]', error);
        res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    if (!checkDbConnection(res)) return;

    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching profile' });
    }
};

module.exports = {
    loginUser,
    registerUser,
    getMe
};
