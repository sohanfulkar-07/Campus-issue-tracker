const Department = require('../models/Department');
const Issue = require('../models/Issue');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public / Private
const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });

        // Calculate active tickets count for each department dynamically
        const formatted = await Promise.all(departments.map(async (d) => {
            const activeCount = await Issue.countDocuments({
                department: d.name,
                status: { $in: ['Pending', 'Assigned', 'In Progress'] }
            });

            return {
                ...d.toObject(),
                id: d.code,
                activeTickets: activeCount
            };
        }));

        res.json({ success: true, count: formatted.length, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching departments', error: error.message });
    }
};

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private (Admin)
const createDepartment = async (req, res) => {
    try {
        const { name, code, manager, slaHours, categories } = req.body;

        if (!name || !code) {
            return res.status(400).json({ success: false, message: 'Department name and code are required' });
        }

        const existing = await Department.findOne({ $or: [{ name }, { code: code.toUpperCase() }] });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Department with this name or code already exists' });
        }

        const dept = await Department.create({
            name,
            code: code.toUpperCase(),
            manager: manager || 'Unassigned',
            slaHours: slaHours || 24,
            categories: categories || []
        });

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: dept
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating department', error: error.message });
    }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin)
const updateDepartment = async (req, res) => {
    try {
        const dept = await Department.findOne({
            $or: [
                { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
                { code: req.params.id.toUpperCase() },
                { name: req.params.id }
            ]
        });

        if (!dept) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        const { name, manager, slaHours, categories } = req.body;

        if (name) dept.name = name;
        if (manager !== undefined) dept.manager = manager;
        if (slaHours !== undefined) dept.slaHours = slaHours;
        if (categories) dept.categories = categories;

        await dept.save();

        res.json({ success: true, message: 'Department updated successfully', data: dept });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating department', error: error.message });
    }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
const deleteDepartment = async (req, res) => {
    try {
        const dept = await Department.findOneAndDelete({
            $or: [
                { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
                { code: req.params.id.toUpperCase() }
            ]
        });

        if (!dept) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        res.json({ success: true, message: `Department ${dept.name} deleted successfully` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting department', error: error.message });
    }
};

module.exports = {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
};
