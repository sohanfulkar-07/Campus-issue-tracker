const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    manager: {
        type: String,
        default: 'Unassigned'
    },
    slaHours: {
        type: Number,
        default: 24
    },
    categories: [{
        type: String
    }],
    activeTicketsCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);
