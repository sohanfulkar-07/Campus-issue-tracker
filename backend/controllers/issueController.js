const Issue = require('../models/Issue');
const IssueStatusHistory = require('../models/IssueStatusHistory');
const User = require('../models/User');

// Helper to format date string
const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// @desc    Create a new issue/complaint
// @route   POST /api/issues
// @access  Private (Student)
const createIssue = async (req, res) => {
    try {
        const { title, category, department, location, description, priority } = req.body;

        if (!title || !category || !location || !description) {
            return res.status(400).json({ success: false, message: 'Please fill in all required issue fields' });
        }

        const issueCount = await Issue.countDocuments();
        const issueId = 'ISSUE-' + (100000 + issueCount + 1);

        // Uploaded files via Multer
        let mediaFiles = [];
        if (req.files && req.files.length > 0) {
            mediaFiles = req.files.map(f => `/uploads/${f.filename}`);
        } else if (req.body.media && Array.isArray(req.body.media)) {
            mediaFiles = req.body.media;
        }

        const newIssue = await Issue.create({
            issueId,
            title,
            category,
            department: department || category,
            location,
            description,
            priority: priority || 'Medium',
            status: 'Pending',
            student: req.user.id,
            studentName: req.user.name,
            studentUserId: req.user.userId,
            media: mediaFiles
        });

        // Audit Trail
        await IssueStatusHistory.create({
            issue: newIssue._id,
            issueId: newIssue.issueId,
            status: 'Pending',
            changedBy: req.user.id,
            changedByName: req.user.name,
            changedByRole: req.user.role,
            notes: 'Issue created by student'
        });

        res.status(201).json({
            success: true,
            message: 'Issue reported successfully',
            issue: {
                ...newIssue.toObject(),
                id: newIssue.issueId,
                date: formatDate(newIssue.createdAt),
                fullDate: newIssue.createdAt.toISOString()
            }
        });
    } catch (error) {
        console.error('[Create Issue Error]', error);
        res.status(500).json({ success: false, message: 'Error creating issue', error: error.message });
    }
};

// @desc    Get student's submitted issues
// @route   GET /api/issues/my-issues
// @access  Private (Student)
const getMyIssues = async (req, res) => {
    try {
        const issues = await Issue.find({ student: req.user.id }).sort({ createdAt: -1 });

        const formatted = issues.map(i => {
            const obj = i.toObject();
            return {
                ...obj,
                id: i.issueId,
                user: i.studentName || req.user.name,
                date: formatDate(i.createdAt),
                fullDate: i.createdAt.toISOString()
            };
        });

        res.json({ success: true, count: formatted.length, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching issues', error: error.message });
    }
};

// @desc    Get faculty assigned issues
// @route   GET /api/issues/assigned
// @access  Private (Faculty)
const getFacultyAssignedIssues = async (req, res) => {
    try {
        // Faculty sees issues assigned to them OR matching their department
        const query = {
            $or: [
                { assignedFaculty: req.user.id },
                { department: req.user.department }
            ]
        };

        const issues = await Issue.find(query).sort({ createdAt: -1 });

        const formatted = issues.map(i => {
            const obj = i.toObject();
            return {
                ...obj,
                id: i.issueId,
                user: i.studentName || 'Student',
                date: formatDate(i.createdAt),
                fullDate: i.createdAt.toISOString()
            };
        });

        res.json({ success: true, count: formatted.length, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching assigned issues', error: error.message });
    }
};

// @desc    Get all issues (Admin/Faculty)
// @route   GET /api/issues
// @access  Private (Admin / Faculty)
const getAllIssues = async (req, res) => {
    try {
        const { status, priority, department, search } = req.query;
        let filter = {};

        if (status && status !== 'All') filter.status = status;
        if (priority && priority !== 'All') filter.priority = priority;
        if (department && department !== 'All') filter.department = department;

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { issueId: { $regex: search, $options: 'i' } },
                { studentName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const issues = await Issue.find(filter).sort({ createdAt: -1 });

        const formatted = issues.map(i => {
            const obj = i.toObject();
            return {
                ...obj,
                id: i.issueId,
                user: i.studentName || 'Student',
                date: formatDate(i.createdAt),
                fullDate: i.createdAt.toISOString()
            };
        });

        res.json({ success: true, count: formatted.length, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching all issues', error: error.message });
    }
};

// @desc    Get single issue details & history
// @route   GET /api/issues/:id
// @access  Private
const getIssueById = async (req, res) => {
    try {
        const issue = await Issue.findOne({
            $or: [
                { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
                { issueId: req.params.id }
            ]
        }).populate('student', 'name email userId rollNo phone')
          .populate('assignedFaculty', 'name email userId employeeId designation');

        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }

        const history = await IssueStatusHistory.find({ issue: issue._id }).sort({ createdAt: 1 });

        res.json({
            success: true,
            data: {
                ...issue.toObject(),
                id: issue.issueId,
                date: formatDate(issue.createdAt),
                history
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching issue details', error: error.message });
    }
};

// @desc    Update issue status & response
// @route   PUT /api/issues/:id/status
// @access  Private (Faculty / Admin)
const updateIssueStatus = async (req, res) => {
    try {
        const { status, responseNotes, assignedFacultyId, priority } = req.body;

        const issue = await Issue.findOne({
            $or: [
                { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
                { issueId: req.params.id }
            ]
        });

        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }

        if (status) issue.status = status;
        if (responseNotes !== undefined) issue.responseNotes = responseNotes;
        if (priority) issue.priority = priority;

        if (assignedFacultyId) {
            const facultyUser = await User.findById(assignedFacultyId);
            if (facultyUser) {
                issue.assignedFaculty = facultyUser._id;
                issue.assignedFacultyName = facultyUser.name;
            }
        }

        await issue.save();

        // Audit Trail entry
        await IssueStatusHistory.create({
            issue: issue._id,
            issueId: issue.issueId,
            status: issue.status,
            changedBy: req.user.id,
            changedByName: req.user.name,
            changedByRole: req.user.role,
            notes: responseNotes || `Status updated to ${issue.status}`
        });

        res.json({
            success: true,
            message: 'Issue status updated successfully',
            data: {
                ...issue.toObject(),
                id: issue.issueId,
                date: formatDate(issue.createdAt)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating issue status', error: error.message });
    }
};

module.exports = {
    createIssue,
    getMyIssues,
    getFacultyAssignedIssues,
    getAllIssues,
    getIssueById,
    updateIssueStatus
};
