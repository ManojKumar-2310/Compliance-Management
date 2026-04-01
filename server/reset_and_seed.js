const mongoose = require('mongoose');
const User = require('./src/models/User');
const Task = require('./src/models/Task');
const Mission = require('./src/models/Mission');
const Regulation = require('./src/models/Regulation');
const Department = require('./src/models/Department');
require('dotenv').config();

const resetAndSeed = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        // 1. Clear Data
        await Promise.all([
            User.deleteMany({}),
            Task.deleteMany({}),
            Mission.deleteMany({}),
            Regulation.deleteMany({}),
            Department.deleteMany({})
        ]);
        console.log('🗑️  Cleared existing data');

        // 2. Create Departments
        const departments = await Department.insertMany([
            { name: 'Healthcare / Medical', description: 'Medical and hospital compliance' },
            { name: 'Education', description: 'Academic and research standards' },
            { name: 'Banking', description: 'Banking and financial operations' },
            { name: 'Finance', description: 'Finance and accounting compliance' },
            { name: 'Insurance', description: 'Insurance policies and claims regulation' },
            { name: 'Information Technology (IT)', description: 'General IT infrastructure and security' },
            { name: 'Software Companies', description: 'Software development and engineering standards' },
            { name: 'Manufacturing', description: 'Industrial safety and production' },
            { name: 'Pharmaceutical', description: 'Clinical trials and drug safety regulations' },
            { name: 'Construction', description: 'Building safety and structural regulations' }
        ]);
        console.log('✅ Created 10 diversified departments');

        // 3. Create Admin & Auditor
        const admin = await User.create({
            name: 'Manoj Compliance Officer',
            email: 'manoj@123',
            password: 'manoj',
            role: 'Admin',
            department: 'Information Technology (IT)',
            designation: 'Compliance Officer'
        });

        const auditor = await User.create({
            name: 'Jane Auditor',
            email: 'auditor@123',
            password: 'auditor',
            role: 'Auditor',
            department: 'Legal',
            designation: 'Internal Auditor'
        });
        console.log('✅ Created Admin (manoj@123 / manoj) and Auditor');

        // 4. Create 20 Personnel (2 per sector)
        const CUSTOM_EMPLOYEES = [
            { name: "Aruna", email: "aruna@123", password: "aruna", unit: "Healthcare / Medical", designation: "Chief Medical Officer" },
            { name: "James", email: "james@123", password: "james", unit: "Healthcare / Medical", designation: "Medical Compliance Lead" },
            { name: "Davika", email: "davika@123", password: "davika", unit: "Education", designation: "Academic Dean" },
            { name: "Michael", email: "michael@123", password: "michael", unit: "Education", designation: "Registrar" },
            { name: "Sarah", email: "sarah@123", password: "sarah", unit: "Banking", designation: "Risk Compliance Manager" },
            { name: "David", email: "david@123", password: "david", unit: "Banking", designation: "AML Specialist" },
            { name: "Robert", email: "robert@123", password: "robert", unit: "Finance", designation: "Financial Auditor" },
            { name: "Emily", email: "emily@123", password: "emily", unit: "Finance", designation: "Investment Compliance Officer" },
            { name: "Kevin", email: "kevin@123", password: "kevin", unit: "Insurance", designation: "Claims Regulatory Analyst" },
            { name: "Chen", email: "chen@123", password: "chen", unit: "Insurance", designation: "Insurance Policy Auditor" },
            { name: "Ajith", email: "ajith@123", password: "ajith", unit: "Information Technology (IT)", designation: "Cloud Architect" },
            { name: "Rahul", email: "rahul@123", password: "rahul", unit: "Information Technology (IT)", designation: "DevOps Engineer" },
            { name: "Manoj", email: "manoj.soft@123", password: "manoj", unit: "Software Companies", designation: "Senior Software Engineer" },
            { name: "Naveen", email: "naveen@123", password: "naveen", unit: "Software Companies", designation: "Site Reliability Engineer" },
            { name: "Arjun", email: "arjun@123", password: "arjun", unit: "Manufacturing", designation: "Plant Manager" },
            { name: "Priya", email: "priya@123", password: "priya", unit: "Manufacturing", designation: "Quality Assurance Lead" },
            { name: "Gupta", email: "gupta@123", password: "gupta", unit: "Pharmaceutical", designation: "Biotech Compliance Officer" },
            { name: "Sneha", email: "sneha@123", password: "sneha", unit: "Pharmaceutical", designation: "Clinical Trial Auditor" },
            { name: "Miller", email: "miller@123", password: "miller", unit: "Construction", designation: "Safety & Ethics Inspector" },
            { name: "Jane", email: "jane@123", password: "jane", unit: "Construction", designation: "Structural Regulatory Lead" }
        ];

        for (const emp of CUSTOM_EMPLOYEES) {
            await User.create({
                name: emp.name,
                email: emp.email,
                password: emp.password,
                role: 'Employee',
                department: emp.unit,
                designation: emp.designation
            });
        }
        console.log('✅ 20 Custom Personnel Onboarded across sectors');

        // 5. Create Sample Regulations
        const sampleRegs = await Regulation.insertMany([
            { title: 'ISO 27001:2022', description: 'Information Security Management System', category: 'IT/Security', effectiveDate: new Date() },
            { title: 'HIPAA Compliance', description: 'Health Insurance Portability and Accountability Act', category: 'Healthcare', effectiveDate: new Date() },
            { title: 'GDPR v2.0', description: 'General Data Protection Regulation', category: 'Privacy', effectiveDate: new Date() },
            { title: 'SOX Section 404', description: 'Sarbanes-Oxley Act for Financial Reporting', category: 'Finance', effectiveDate: new Date() }
        ]);
        console.log('✅ Created 4 Global Regulations');

        // 6. Create 30 Sample Tasks (Assign to employees)
        const employees = await User.find({ role: 'Employee' });
        const taskStatuses = ['Pending', 'In Progress', 'Submitted', 'Approved', 'Rejected', 'Overdue'];
        const priorities = ['Low', 'Medium', 'High', 'Critical'];

        for (let i = 0; i < 30; i++) {
            const randomEmp = employees[Math.floor(Math.random() * employees.length)];
            const randomReg = sampleRegs[Math.floor(Math.random() * sampleRegs.length)];
            const randomStatus = taskStatuses[Math.floor(Math.random() * taskStatuses.length)];
            
            await Task.create({
                title: `Compliance Audit ${i + 1}: ${randomReg.title}`,
                description: `Conduct internal verification for ${randomReg.title} protocols within the ${randomEmp.department} unit.`,
                regulationId: randomReg._id,
                assignedTo: randomEmp._id,
                dueDate: new Date(Date.now() + (Math.random() > 0.5 ? 864000000 : -864000000)), // Some overdue
                status: randomStatus,
                priority: priorities[Math.floor(Math.random() * priorities.length)],
                auditFeedback: randomStatus === 'Approved' ? { remarks: 'Protocol verified and approved.', auditor: admin._id } : {}
            });
        }
        console.log('✅ Generated 30 Real-time Compliance Tasks');

        console.log('\n🚀 Database Reset and Seeded Successfully!');
        console.log('\n--- Admin Access ---');
        console.log('Email: manoj@123');
        console.log('Password: manoj');
        console.log('\n--- Auditor Access ---');
        console.log('Email: auditor@123');
        console.log('Password: auditor');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

resetAndSeed();
