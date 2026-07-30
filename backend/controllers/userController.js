const User = require('../models/User');

// @desc    Get all users (with role filter)
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
    try {
        const { role, department, search } = req.query;
        let filter = {};

        if (role && role !== 'All') filter.role = role;
        if (department && department !== 'All') filter.department = department;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { userId: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

        const formatted = users.map(u => ({
            ...u.toObject(),
            id: u.userId,
            joinedDate: u.createdAt ? u.createdAt.toISOString().split('T')[0] : 'N/A'
        }));

        res.json({ success: true, count: formatted.length, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
    }
};

// @desc    Create a user (Admin)
// @route   POST /api/users
// @access  Private (Admin)
const createUser = async (req, res) => {
    try {
        const { userId, name, email, password, role, department, designation, phone, rollNo, employeeId } = req.body;

        if (!userId || !name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Please provide all required user details' });
        }

        const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { userId }] });
        if (existing) {
            return res.status(400).json({ success: false, message: 'User with this ID or Email already exists' });
        }

        const user = await User.create({
            userId,
            name,
            email: email.toLowerCase(),
            password,
            role,
            department: department || 'General',
            designation: designation || '',
            phone: phone || '',
            rollNo: rollNo || '',
            employeeId: employeeId || ''
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                id: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
    }
};

// @desc    Update a user (Admin)
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
    try {
        const user = await User.findOne({
            $or: [
                { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
                { userId: req.params.id }
            ]
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { name, email, role, department, designation, phone, rollNo, employeeId, isActive, password } = req.body;

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (department) user.department = department;
        if (designation !== undefined) user.designation = designation;
        if (phone !== undefined) user.phone = phone;
        if (rollNo !== undefined) user.rollNo = rollNo;
        if (employeeId !== undefined) user.employeeId = employeeId;
        if (isActive !== undefined) user.isActive = isActive;
        if (password) user.password = password;

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            data: {
                id: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
    }
};

// @desc    Delete/Deactivate user (Admin)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({
            $or: [
                { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
                { userId: req.params.id }
            ]
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: `User ${user.userId} deleted successfully` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting user', error: error.message });
    }
};

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser
};
