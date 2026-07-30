const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Department = require('../models/Department');
const Issue = require('../models/Issue');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_issue_tracker');
        console.log('[Seed] Connected to MongoDB...');

        // Clear existing data (optional / idempotent)
        await User.deleteMany({});
        await Department.deleteMany({});
        await Issue.deleteMany({});

        console.log('[Seed] Cleared existing database records.');

        // Seed Users
        const users = await User.create([
            {
                userId: 'admin',
                name: 'System Administrator',
                email: 'admin@university.edu',
                password: 'adminpassword123',
                role: 'admin',
                department: 'Administration',
                phone: '+1 555-0100',
                employeeId: 'ADM-001',
                designation: 'Chief Administrator'
            },
            {
                userId: 'EMP-1024',
                name: 'Dr. Jane Doe',
                email: 'jane.doe@university.edu',
                password: 'facultypassword123',
                role: 'faculty',
                department: 'Computer Science',
                phone: '+1 555-0101',
                employeeId: 'EMP-1024',
                designation: 'Senior Professor'
            },
            {
                userId: 'EMP-2048',
                name: 'Prof. Robert Smith',
                email: 'robert.smith@university.edu',
                password: 'facultypassword123',
                role: 'faculty',
                department: 'Electrical Engineering',
                phone: '+1 555-0102',
                employeeId: 'EMP-2048',
                designation: 'Associate Professor'
            },
            {
                userId: '21CS045',
                name: 'Alex Johnson',
                email: 'alex.j@university.edu',
                password: 'studentpassword123',
                role: 'student',
                department: 'Computer Science',
                phone: '+1 555-0199',
                rollNo: '21CS045',
                semester: 'Semester 6'
            },
            {
                userId: '22EE012',
                name: 'Maria Garcia',
                email: 'maria.g@university.edu',
                password: 'studentpassword123',
                role: 'student',
                department: 'Electrical Engineering',
                phone: '+1 555-0198',
                rollNo: '22EE012',
                semester: 'Semester 4'
            }
        ]);

        console.log(`[Seed] Seeded ${users.length} users successfully.`);

        // Seed Departments
        const departments = await Department.create([
            {
                name: 'IT & Infrastructure',
                code: 'IT',
                manager: 'Dr. Jane Doe',
                slaHours: 24,
                categories: ['Wi-Fi / Network', 'Server Outage', 'Hardware Failure', 'Software Request']
            },
            {
                name: 'Facilities & Campus Maintenance',
                code: 'FAC',
                manager: 'Prof. Robert Smith',
                slaHours: 48,
                categories: ['Electricity / Power', 'Plumbing', 'Furniture Damage', 'HVAC / Air Conditioning']
            },
            {
                name: 'Academic Affairs',
                code: 'ACA',
                manager: 'Dr. Jane Doe',
                slaHours: 36,
                categories: ['Exam Schedule', 'Grade Dispute', 'Classroom Allocation', 'Attendance']
            },
            {
                name: 'Hostel & Mess',
                code: 'HST',
                manager: 'Admin',
                slaHours: 24,
                categories: ['Room Maintenance', 'Mess Quality', 'Water Supply', 'Security']
            }
        ]);

        console.log(`[Seed] Seeded ${departments.length} departments successfully.`);

        // Seed Sample Issues
        const studentAlex = users.find(u => u.userId === '21CS045');
        const facultyJane = users.find(u => u.userId === 'EMP-1024');

        const issues = await Issue.create([
            {
                issueId: 'ISSUE-100001',
                title: 'Library Wi-Fi Connectivity Dropping Frequently',
                category: 'Wi-Fi / Network',
                department: 'IT & Infrastructure',
                location: 'Central Library, 2nd Floor',
                description: 'The Wi-Fi access point on the 2nd floor library reading room keeps disconnecting every 5 minutes.',
                status: 'In Progress',
                priority: 'High',
                student: studentAlex._id,
                studentName: studentAlex.name,
                studentUserId: studentAlex.userId,
                assignedFaculty: facultyJane._id,
                assignedFacultyName: facultyJane.name,
                responseNotes: 'Network team has replaced the router on 2nd floor. Testing signal strength.'
            },
            {
                issueId: 'ISSUE-100002',
                title: 'Projector Defective in Lab 304',
                category: 'Hardware Failure',
                department: 'IT & Infrastructure',
                location: 'CS Block, Lab 304',
                description: 'The projector HDMI port is loose and display flickers continuously during lectures.',
                status: 'Pending',
                priority: 'Medium',
                student: studentAlex._id,
                studentName: studentAlex.name,
                studentUserId: studentAlex.userId
            }
        ]);

        console.log(`[Seed] Seeded ${issues.length} initial issues successfully.`);
        console.log('[Seed] Database Seeding Complete!');
        process.exit(0);
    } catch (error) {
        console.error('[Seed Error]', error);
        process.exit(1);
    }
};

seedData();
