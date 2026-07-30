const mongoose = require('mongoose');

const issueStatusHistorySchema = new mongoose.Schema({
    issue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue',
        required: true
    },
    issueId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    changedByName: {
        type: String,
        default: 'System'
    },
    changedByRole: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('IssueStatusHistory', issueStatusHistorySchema);
