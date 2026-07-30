const Issue = require('../models/Issue');
const User = require('../models/User');
const Department = require('../models/Department');

// @desc    Get dashboard analytics & key metrics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAdminAnalytics = async (req, res) => {
    try {
        const totalIssues = await Issue.countDocuments();
        const pendingIssues = await Issue.countDocuments({ status: 'Pending' });
        const inProgressIssues = await Issue.countDocuments({ status: 'In Progress' });
        const resolvedIssues = await Issue.countDocuments({ status: 'Resolved' });
        const rejectedIssues = await Issue.countDocuments({ status: 'Rejected' });

        const totalUsers = await User.countDocuments();
        const studentCount = await User.countDocuments({ role: 'student' });
        const facultyCount = await User.countDocuments({ role: 'faculty' });
        const adminCount = await User.countDocuments({ role: 'admin' });

        const totalDepartments = await Department.countDocuments();

        res.json({
            success: true,
            analytics: {
                totalIssues,
                pendingIssues,
                inProgressIssues,
                resolvedIssues,
                rejectedIssues,
                totalUsers,
                studentCount,
                facultyCount,
                adminCount,
                totalDepartments
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error loading admin analytics', error: error.message });
    }
};

module.exports = {
    getAdminAnalytics
};
