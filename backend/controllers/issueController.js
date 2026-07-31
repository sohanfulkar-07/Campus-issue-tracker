const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const IssueStatusHistory = require('../models/IssueStatusHistory');
const User = require('../models/User');

const { canUserAccessIssue, getFacultyQuery } = require('../utils/issueRouting');

const ALLOWED_STATUSES = ['New / Unassigned', 'In Progress', 'Resolved', 'Rejected'];
const ALLOWED_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];


const COMPLAINT_CATEGORIES = [
    'IT Support',
    'Hostel Maintenance',
    'Academic Operations',
    'Facilities & Security',
    'Other'
];

// Helper to format date string
const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Helper to generate a collision-safe unique issueId
const generateUniqueIssueId = async () => {
    let isUnique = false;
    let issueId = '';
    let attempts = 0;
    while (!isUnique && attempts < 10) {
        attempts++;
        const count = await Issue.countDocuments();
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        issueId = `ISSUE-${100000 + count + attempts}-${randomSuffix}`;
        const existing = await Issue.findOne({ issueId });
        if (!existing) {
            isUnique = true;
        }
    }
    if (!isUnique) {
        issueId = `ISSUE-${Date.now()}`;
    }
    return issueId;
};

// @desc    Create a new issue/complaint
// @route   POST /api/issues
// @access  Private (Student)
const createIssue = async (req, res) => {
    try {
        const { title, category, department, location, description, priority } = req.body;

        if (!title || !category || !location || !description) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required issue fields: title, category, location, and description'
            });
        }

        if (priority && !ALLOWED_PRIORITIES.includes(priority)) {
            return res.status(400).json({
                success: false,
                message: `Invalid priority '${priority}'. Allowed priorities are: ${ALLOWED_PRIORITIES.join(', ')}`
            });
        }

        const issueId = await generateUniqueIssueId();

        // Process uploaded files (Multer disk storage) or direct array
        let mediaFiles = [];
        if (req.files && req.files.length > 0) {
            mediaFiles = req.files.map(f => `/uploads/${f.filename}`);
        } else if (req.body.media && Array.isArray(req.body.media)) {
            mediaFiles = req.body.media;
        }

        // Determine department: default to 'General' unless a legitimate non-category department is explicitly provided
        let issueDepartment = 'General';
        if (department && !COMPLAINT_CATEGORIES.includes(department) && department !== category) {
            issueDepartment = department;
        }

        const newIssue = await Issue.create({
            issueId,
            title,
            category,
            department: issueDepartment,
            location,
            description,
            priority: priority || 'Medium',
            status: 'New / Unassigned',
            student: req.user.id,
            studentName: req.user.name,
            studentUserId: req.user.userId,
            media: mediaFiles
        });

        // Audit Trail Record
        await IssueStatusHistory.create({
            issue: newIssue._id,
            issueId: newIssue.issueId,
            status: 'New / Unassigned',
            changedBy: req.user.id,
            changedByName: req.user.name,
            changedByRole: req.user.role,
            notes: 'Issue reported by student'
        });

        res.status(201).json({
            success: true,
            message: 'Issue reported successfully',
            issue: {
                ...newIssue.toObject(),
                id: newIssue.issueId,
                user: newIssue.studentName,
                date: formatDate(newIssue.createdAt),
                fullDate: newIssue.createdAt.toISOString()
            }
        });
    } catch (error) {
        console.error('[Create Issue Error]', error);
        res.status(500).json({ success: false, message: 'Error creating issue', error: error.message });
    }
};

// @desc    Get logged-in student's submitted issues
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

// @desc    Get faculty assigned/department issues
// @route   GET /api/issues/assigned
// @access  Private (Faculty / Admin)
const getFacultyAssignedIssues = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'faculty') {
            query = getFacultyQuery(req.user);
        }

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

// @desc    Get all issues with filters
// @route   GET /api/issues
// @access  Private (Admin / Faculty)
const getAllIssues = async (req, res) => {
    try {
        const { status, priority, department, category, search } = req.query;
        let filter = {};

        if (status && status !== 'All') filter.status = status;
        if (priority && priority !== 'All') filter.priority = priority;
        if (category && category !== 'All') filter.category = category;

        if (department && department !== 'All') {
            const facultyInDept = await User.find({ department }).select('_id');
            const facultyIds = facultyInDept.map(f => f._id);
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { department: department },
                    { assignedFaculty: { $in: facultyIds } }
                ]
            });
        }

        if (search) {
            const searchObj = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { issueId: { $regex: search, $options: 'i' } },
                    { studentName: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            };
            if (filter.$and) {
                filter.$and.push(searchObj);
            } else {
                filter.$or = searchObj.$or;
            }
        }

        const issues = await Issue.find(filter)
            .populate('assignedFaculty', 'name email department')
            .sort({ createdAt: -1 });

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
        res.status(500).json({ success: false, message: 'Error fetching issues', error: error.message });
    }
};

// @desc    Get single issue details & audit history
// @route   GET /api/issues/:id
// @access  Private
const getIssueById = async (req, res) => {
    try {
        const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
        const issue = await Issue.findOne({
            $or: [
                ...(isObjectId ? [{ _id: req.params.id }] : []),
                { issueId: req.params.id }
            ]
        }).populate('student', 'name email userId rollNo phone')
          .populate('assignedFaculty', 'name email userId employeeId designation department');

        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }

        // Permission check via central routing helper
        if (!canUserAccessIssue(req.user, issue)) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this issue' });
        }

        const history = await IssueStatusHistory.find({ issue: issue._id }).sort({ createdAt: 1 });

        res.json({
            success: true,
            data: {
                ...issue.toObject(),
                id: issue.issueId,
                user: issue.studentName || (issue.student ? issue.student.name : 'Student'),
                date: formatDate(issue.createdAt),
                fullDate: issue.createdAt.toISOString(),
                history
            }
        });
    } catch (error) {
        console.error('[Get Issue Error]', error);
        res.status(500).json({ success: false, message: 'Error fetching issue details', error: error.message });
    }
};

// @desc    Update issue status, priority, and faculty assignment
// @route   PUT /api/issues/:id/status
// @access  Private (Faculty / Admin)
const updateIssueStatus = async (req, res) => {
    try {
        const { status, responseNotes, assignedFacultyId, priority } = req.body;

        if (status && !ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status '${status}'. Allowed statuses are: ${ALLOWED_STATUSES.join(', ')}`
            });
        }

        if (priority && !ALLOWED_PRIORITIES.includes(priority)) {
            return res.status(400).json({
                success: false,
                message: `Invalid priority '${priority}'. Allowed priorities are: ${ALLOWED_PRIORITIES.join(', ')}`
            });
        }

        const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
        const issue = await Issue.findOne({
            $or: [
                ...(isObjectId ? [{ _id: req.params.id }] : []),
                { issueId: req.params.id }
            ]
        });

        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }

        // Permission check via central routing helper
        if (!canUserAccessIssue(req.user, issue)) {
            return res.status(403).json({ success: false, message: 'Not authorized to modify this issue' });
        }

        let statusChanged = false;
        let assignmentChanged = false;

        if (status && issue.status !== status) {
            issue.status = status;
            statusChanged = true;
        }

        if (responseNotes !== undefined) {
            issue.responseNotes = responseNotes;
        }

        if (priority) {
            issue.priority = priority;
        }

        if (assignedFacultyId) {
            if (!mongoose.Types.ObjectId.isValid(assignedFacultyId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid faculty ID format'
                });
            }

            const facultyUser = await User.findById(assignedFacultyId);
            if (!facultyUser || !['faculty', 'admin'].includes(facultyUser.role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Assigned user must be a valid faculty member or admin'
                });
            }

            if (!issue.assignedFaculty || issue.assignedFaculty.toString() !== facultyUser._id.toString()) {
                issue.assignedFaculty = facultyUser._id;
                issue.assignedFacultyName = facultyUser.name;
                assignmentChanged = true;
            }
        }

        await issue.save();

        // Create Audit History Record if status, assignment, or response notes changed
        if (statusChanged || assignmentChanged || responseNotes) {
            let noteText = responseNotes || `Status updated to '${issue.status}'`;
            if (assignmentChanged) {
                noteText += ` and assigned to ${issue.assignedFacultyName}`;
            }

            await IssueStatusHistory.create({
                issue: issue._id,
                issueId: issue.issueId,
                status: issue.status,
                changedBy: req.user.id,
                changedByName: req.user.name,
                changedByRole: req.user.role,
                notes: noteText
            });
        }

        res.json({
            success: true,
            message: 'Issue updated successfully',
            data: {
                ...issue.toObject(),
                id: issue.issueId,
                user: issue.studentName || 'Student',
                date: formatDate(issue.createdAt)
            }
        });
    } catch (error) {
        console.error('[Update Issue Status Error]', error);
        res.status(500).json({ success: false, message: 'Error updating issue status', error: error.message });
    }
};

// @desc    Delete issue & its status history
// @route   DELETE /api/issues/:id
// @access  Private (Admin)
const deleteIssue = async (req, res) => {
    try {
        const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
        const issue = await Issue.findOne({
            $or: [
                ...(isObjectId ? [{ _id: req.params.id }] : []),
                { issueId: req.params.id }
            ]
        });

        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }

        // Delete associated audit history
        await IssueStatusHistory.deleteMany({ issue: issue._id });

        // Delete issue document
        await Issue.deleteOne({ _id: issue._id });

        res.json({
            success: true,
            message: `Issue ${issue.issueId} and its audit history deleted successfully`
        });
    } catch (error) {
        console.error('[Delete Issue Error]', error);
        res.status(500).json({ success: false, message: 'Error deleting issue', error: error.message });
    }
};

module.exports = {
    createIssue,
    getMyIssues,
    getFacultyAssignedIssues,
    getAllIssues,
    getIssueById,
    updateIssueStatus,
    deleteIssue
};
