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

        const searchInput = userId.trim();
        const user = await User.findOne({
            $or: [
                { userId: searchInput },
                { email: searchInput.toLowerCase() },
                { rollNo: searchInput }
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

// @desc    Register a new student account
// @route   POST /api/auth/register
// @access  Public (Student creation only)
const registerUser = async (req, res) => {
    if (!checkDbConnection(res)) return;

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            success: false,
            message: 'Server configuration error: JWT_SECRET environment variable is not configured.'
        });
    }

    try {
        let { name, email, password, rollNo, department } = req.body;

        // 1. Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields: Name, Email, and Password.'
            });
        }

        name = name.trim();
        email = email.trim().toLowerCase();
        password = password.trim();
        rollNo = rollNo ? rollNo.trim() : '';
        department = department ? department.trim() : 'General';

        // 2. Validate email format
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address.'
            });
        }

        // 3. Enforce minimum password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.'
            });
        }

        // 4. Generate unique userId automatically
        let autoUserId = rollNo ? rollNo : `STU-${Date.now()}`;

        // 5. Check for duplicate email, rollNo, or userId
        const duplicateConditions = [
            { email },
            { userId: autoUserId }
        ];
        if (rollNo) {
            duplicateConditions.push({ rollNo });
        }

        const userExists = await User.findOne({ $or: duplicateConditions });

        if (userExists) {
            if (userExists.email === email) {
                return res.status(400).json({
                    success: false,
                    message: 'An account with this email address is already registered.'
                });
            }
            if (rollNo && userExists.rollNo === rollNo) {
                return res.status(400).json({
                    success: false,
                    message: 'An account with this Roll Number is already registered.'
                });
            }
            return res.status(400).json({
                success: false,
                message: 'An account with this User ID or Roll Number is already registered.'
            });
        }

        // 6. Create new student user (Strictly role="student" and isActive=true)
        const newUser = await User.create({
            userId: autoUserId,
            name,
            email,
            password,
            role: 'student',
            department,
            rollNo,
            isActive: true
        });

        const token = generateToken(newUser._id);

        res.status(201).json({
            success: true,
            message: 'Student account registered successfully',
            token,
            user: {
                id: newUser._id,
                userId: newUser.userId,
                name: newUser.name,
                email: newUser.email,
                role: 'student',
                department: newUser.department,
                rollNo: newUser.rollNo
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

// @desc    Change logged in user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    if (!checkDbConnection(res)) return;

    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both current password and new password.'
            });
        }

        if (confirmPassword && newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password and confirmation password do not match.'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long.'
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User account not found.'
            });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect current password. Please try again.'
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password cannot be the same as your current password.'
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('[Change Password Error]', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating password',
            error: error.message
        });
    }
};

module.exports = {
    loginUser,
    registerUser,
    getMe,
    changePassword
};
