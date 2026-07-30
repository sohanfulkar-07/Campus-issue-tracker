const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    issueId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Issue title is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required']
    },
    department: {
        type: String,
        required: [true, 'Department is required']
    },
    location: {
        type: String,
        required: [true, 'Location is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    status: {
        type: String,
        enum: ['New / Unassigned', 'In Progress', 'Resolved', 'Rejected'],
        default: 'New / Unassigned'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentName: {
        type: String,
        default: ''
    },
    studentUserId: {
        type: String,
        default: ''
    },
    assignedFaculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    assignedFacultyName: {
        type: String,
        default: 'Unassigned'
    },
    media: [{
        type: String
    }],
    responseNotes: {
        type: String,
        default: ''
    },
    resolutionHours: {
        type: Number,
        default: 0
    },
    ackHours: {
        type: Number,
        default: 0
    },
    satisfaction: {
        type: Number,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Issue', issueSchema);
