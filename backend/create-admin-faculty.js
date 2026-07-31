require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');

const users = [
    {
        userId: 'admin001',
        name: 'Campus Admin',
        email: 'admin@campusissuetracker.com',
        password: 'Admin@12345',
        role: 'admin',
        department: 'Administration',
        designation: 'System Administrator',
        phone: '',
        rollNo: '',
        employeeId: 'ADMIN001'
    },
    {
        userId: 'faculty001',
        name: 'CS Faculty',
        email: 'faculty@campusissuetracker.com',
        password: 'Faculty@12345',
        role: 'faculty',
        department: 'Computer Science',
        designation: 'Faculty',
        phone: '',
        rollNo: '',
        employeeId: 'FAC001'
    },
    {
        userId: 'faculty_ce',
        name: 'Computer Engineering Faculty',
        email: 'faculty.ce@campusissuetracker.com',
        password: 'FacultyCE@12345',
        role: 'faculty',
        department: 'Computer Engineering',
        designation: 'Faculty',
        phone: '',
        rollNo: '',
        employeeId: 'FAC-CE-001'
    },
    {
        userId: 'faculty_it',
        name: 'Information Technology Faculty',
        email: 'faculty.it@campusissuetracker.com',
        password: 'FacultyIT@12345',
        role: 'faculty',
        department: 'Information Technology',
        designation: 'Faculty',
        phone: '',
        rollNo: '',
        employeeId: 'FAC-IT-001'
    },
    {
        userId: 'faculty_aids',
        name: 'AI & Data Science Faculty',
        email: 'faculty.aids@campusissuetracker.com',
        password: 'FacultyAIDS@12345',
        role: 'faculty',
        department: 'Artificial Intelligence & Data Science',
        designation: 'Faculty',
        phone: '',
        rollNo: '',
        employeeId: 'FAC-AIDS-001'
    },
    {
        userId: 'faculty_aiml',
        name: 'AI & Machine Learning Faculty',
        email: 'faculty.aiml@campusissuetracker.com',
        password: 'FacultyAIML@12345',
        role: 'faculty',
        department: 'Artificial Intelligence & Machine Learning',
        designation: 'Faculty',
        phone: '',
        rollNo: '',
        employeeId: 'FAC-AIML-001'
    }
];

async function createUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected.');

        for (const userData of users) {
            const existingUser = await User.findOne({
                $or: [
                    { userId: userData.userId },
                    { email: userData.email }
                ]
            });

            if (existingUser) {
                console.log(`Already exists: ${userData.userId}`);
                continue;
            }

            const user = await User.create(userData);

            console.log(`Created: ${user.userId} (${user.role})`);
        }

        console.log('\nAdmin and Faculty setup completed.');
    } catch (error) {
        console.error('Setup failed:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

createUsers();