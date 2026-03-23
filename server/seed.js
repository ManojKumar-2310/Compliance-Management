const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');
const Department = require('./src/models/Department');
const Regulation = require('./src/models/Regulation');
const Task = require('./src/models/Task');

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Department.deleteMany({});
        await Regulation.deleteMany({});
        await Task.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create Departments
        const departments = await Department.insertMany([
            { name: 'Human Resources', description: 'HR and employee management' },
            { name: 'Finance', description: 'Financial operations and compliance' },
            { name: 'IT & Security', description: 'Technology and cybersecurity' },
            { name: 'Legal', description: 'Legal compliance and contracts' },
            { name: 'Operations', description: 'Business operations' }
        ]);
        console.log('✅ Created 5 departments');

        // Hash password
        const hashedPassword = await bcrypt.hash('manoj@123', 10);

        // Create Users
        const users = await User.insertMany([
            // Admin
            {
                name: 'Manoj Admin',
                email: 'cheran@123',
                password: await bcrypt.hash('cheran', 10),
                role: 'Admin',
                department: departments[0]._id,
                isActive: true
            },
            // Employees
            {
                name: 'John Smith',
                email: 'employee@example.com',
                password: hashedPassword,
                role: 'Employee',
                department: departments[1]._id,
                isActive: true
            },
            {
                name: 'Sarah Johnson',
                email: 'sarah@example.com',
                password: hashedPassword,
                role: 'Employee',
                department: departments[2]._id,
                isActive: true
            },
            {
                name: 'Michael Brown',
                email: 'michael@example.com',
                password: hashedPassword,
                role: 'Employee',
                department: departments[3]._id,
                isActive: true
            },
            // Auditor
            {
                name: 'Jane Auditor',
                email: 'auditor@example.com',
                password: hashedPassword,
                role: 'Auditor',
                department: departments[4]._id,
                isActive: true
            }
        ]);
        console.log('✅ Created 5 users (1 Admin, 3 Employees, 1 Auditor)');

        // Create Regulations
        const regulations = await Regulation.insertMany([
            {
                title: 'GDPR Compliance',
                description: 'General Data Protection Regulation compliance requirements',
                category: 'Data Privacy',
                effectiveDate: new Date('2023-01-01'),
                currentVersion: '2.0',
                status: 'Active',
                createdBy: users[0]._id
            },
            {
                title: 'SOX Financial Controls',
                description: 'Sarbanes-Oxley Act financial reporting controls',
                category: 'Financial',
                effectiveDate: new Date('2023-02-01'),
                currentVersion: '3.1',
                status: 'Active',
                createdBy: users[0]._id
            },
            {
                title: 'ISO 27001 Information Security',
                description: 'Information security management system standard',
                category: 'Security',
                effectiveDate: new Date('2023-03-01'),
                currentVersion: '1.5',
                status: 'Active',
                createdBy: users[0]._id
            },
            {
                title: 'HIPAA Healthcare Privacy',
                description: 'Health Insurance Portability and Accountability Act',
                category: 'Healthcare',
                effectiveDate: new Date('2023-04-01'),
                currentVersion: '4.0',
                status: 'Active',
                createdBy: users[0]._id
            },
            {
                title: 'PCI DSS Payment Security',
                description: 'Payment Card Industry Data Security Standard',
                category: 'Financial',
                effectiveDate: new Date('2023-05-01'),
                currentVersion: '4.0.1',
                status: 'Active',
                createdBy: users[0]._id
            }
        ]);
        console.log('✅ Created 5 regulations');

        // Create Tasks
        const tasks = await Task.insertMany([
            {
                title: 'Quarterly Data Privacy Audit',
                description: 'Conduct comprehensive review of data handling procedures',
                regulationId: regulations[0]._id,
                assignedTo: users[1]._id,
                createdBy: users[0]._id,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                priority: 'High',
                status: 'Pending',
                department: departments[1]._id
            },
            {
                title: 'Financial Controls Documentation',
                description: 'Update and verify financial control documentation',
                regulationId: regulations[1]._id,
                assignedTo: users[2]._id,
                createdBy: users[0]._id,
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
                priority: 'Critical',
                status: 'In Progress',
                department: departments[2]._id
            },
            {
                title: 'Security Vulnerability Assessment',
                description: 'Perform vulnerability scanning and remediation',
                regulationId: regulations[2]._id,
                assignedTo: users[3]._id,
                createdBy: users[0]._id,
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
                priority: 'High',
                status: 'Submitted',
                department: departments[3]._id
            },
            {
                title: 'Employee Privacy Training',
                description: 'Complete mandatory privacy awareness training',
                regulationId: regulations[3]._id,
                assignedTo: users[1]._id,
                createdBy: users[0]._id,
                dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Overdue
                priority: 'Medium',
                status: 'Pending',
                department: departments[1]._id
            },
            {
                title: 'PCI Compliance Report',
                description: 'Generate and submit quarterly PCI compliance report',
                regulationId: regulations[4]._id,
                assignedTo: users[2]._id,
                createdBy: users[0]._id,
                dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days
                priority: 'High',
                status: 'Under Review',
                department: departments[2]._id
            },
            {
                title: 'Access Control Review',
                description: 'Review and update user access permissions',
                regulationId: regulations[2]._id,
                assignedTo: users[3]._id,
                createdBy: users[0]._id,
                dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
                priority: 'Medium',
                status: 'Approved',
                department: departments[3]._id
            }
        ]);
        console.log('✅ Created 6 tasks with various statuses');

        console.log('\n✨ Database seeded successfully!\n');
        console.log('📧 Test Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Admin:');
        console.log('  Email: cheran@123');
        console.log('  Password: cheran\n');
        console.log('Employees:');
        console.log('  Email: employee@example.com (John Smith)');
        console.log('  Email: sarah@example.com (Sarah Johnson)');
        console.log('  Email: michael@example.com (Michael Brown)');
        console.log('  Password: password123\n');
        console.log('Auditor:');
        console.log('  Email: auditor@example.com');
        console.log('  Password: password123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
