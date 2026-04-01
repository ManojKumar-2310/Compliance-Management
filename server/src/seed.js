const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Regulation = require('./models/Regulation');
const Task = require('./models/Task');
const Department = require('./models/Department');
const bcrypt = require('bcryptjs');

dotenv.config();

const CUSTOM_EMPLOYEES = [
    // Sector 1: Healthcare & Medical
    { name: "Aruna", email: "aruna@123", password: "aruna", unit: "Healthcare / Medical", designation: "Chief Medical Officer" },
    { name: "James", email: "james@123", password: "james", unit: "Healthcare / Medical", designation: "Medical Compliance Lead" },

    // Sector 2: Education
    { name: "Davika", email: "davika@123", password: "davika", unit: "Education", designation: "Academic Dean" },
    { name: "Michael", email: "michael@123", password: "michael", unit: "Education", designation: "Registrar" },

    // Sector 3: Banking
    { name: "Sarah", email: "sarah@123", password: "sarah", unit: "Banking", designation: "Risk Compliance Manager" },
    { name: "David", email: "david@123", password: "david", unit: "Banking", designation: "AML Specialist" },

    // Sector 4: Finance
    { name: "Robert", email: "robert@123", password: "robert", unit: "Finance", designation: "Financial Auditor" },
    { name: "Emily", email: "emily@123", password: "emily", unit: "Finance", designation: "Investment Compliance Officer" },

    // Sector 5: Insurance
    { name: "Kevin", email: "kevin@123", password: "kevin", unit: "Insurance", designation: "Claims Regulatory Analyst" },
    { name: "Chen", email: "chen@123", password: "chen", unit: "Insurance", designation: "Insurance Policy Auditor" },

    // Sector 6: Information Technology (IT)
    { name: "Ajith", email: "ajith@123", password: "ajith", unit: "Information Technology (IT)", designation: "Cloud Architect" },
    { name: "Rahul", email: "rahul@123", password: "rahul", unit: "Information Technology (IT)", designation: "DevOps Engineer" },

    // Sector 7: Software Companies
    { name: "Manoj", email: "manoj.soft@123", password: "manoj", unit: "Software Companies", designation: "Senior Software Engineer" },
    { name: "Naveen", email: "naveen@123", password: "naveen", unit: "Software Companies", designation: "Site Reliability Engineer" },

    // Sector 8: Manufacturing
    { name: "Arjun", email: "arjun@123", password: "arjun", unit: "Manufacturing", designation: "Plant Manager" },
    { name: "Priya", email: "priya@123", password: "priya", unit: "Manufacturing", designation: "Quality Assurance Lead" },

    // Sector 9: Pharmaceutical
    { name: "Gupta", email: "gupta@123", password: "gupta", unit: "Pharmaceutical", designation: "Biotech Compliance Officer" },
    { name: "Sneha", email: "sneha@123", password: "sneha", unit: "Pharmaceutical", designation: "Clinical Trial Auditor" },

    // Sector 10: Construction
    { name: "Miller", email: "miller@123", password: "miller", unit: "Construction", designation: "Safety & Ethics Inspector" },
    { name: "Jane", email: "jane@123", password: "jane", unit: "Construction", designation: "Structural Regulatory Lead" }
];

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected for Seeding');
        seedData();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const seedData = async () => {
    try {
        await User.deleteMany();
        await Regulation.deleteMany();
        await Task.deleteMany();
        await Department.deleteMany();

        console.log('🗑️  Cleared existing data');

        // Create Departments First
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

        const deptMap = {};
        departments.forEach(d => { deptMap[d.name] = d._id; });

        // Admin
        const admin = await User.create({
            name: 'Manoj Compliance Officer',
            email: 'manoj@123',
            password: 'manoj',
            role: 'Admin',
            department: 'Information Technology (IT)',
            designation: 'Compliance Officer'
        });

        console.log('Compliance Officer Created: manoj@123 / manoj');

        // Auditor
        await User.create({
            name: 'Jane Auditor',
            email: 'auditor@123',
            password: 'auditor',
            role: 'Auditor',
            department: 'Legal',
            designation: 'Internal Auditor'
        });

        console.log('Auditor Created: auditor@123 / auditor');

        // Create 20 Personnel
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

        console.log('✅ 20 Custom Personnel Onboarded');

        // Create Regulation
        await Regulation.create({
            title: 'GDPR Compliance',
            description: 'General Data Protection Regulation standards.',
            category: 'Data Privacy',
            effectiveDate: new Date(),
            createdBy: admin._id
        });

        console.log('Regulation Created');

        // Create Sample Missions for Department Performance
        console.log('Seeding Sample Missions...');
        const Mission = require('./models/Mission');
        const missionObjectives = [
            { obj: 'Health Safety Audit', dept: 'Healthcare / Medical', spec: 'Aruna' },
            { obj: 'Curriculum Compliance', dept: 'Education', spec: 'Davika' },
            { obj: 'KYC Verification', dept: 'Banking', spec: 'Sarah' },
            { obj: 'Quarterly Audit', dept: 'Finance', spec: 'Robert' },
            { obj: 'Policy Review', dept: 'Insurance', spec: 'Kevin' },
            { obj: 'Security Patching', dept: 'Information Technology (IT)', spec: 'Ajith' },
            { obj: 'QA Automation', dept: 'Software Companies', spec: 'Manoj' },
            { obj: 'ISO Certification', dept: 'Manufacturing', spec: 'Arjun' },
            { obj: 'Clinical Trial Audit', dept: 'Pharmaceutical', spec: 'Gupta' },
            { obj: 'Safety Inspection', dept: 'Construction', spec: 'Miller' },
            { obj: 'Legal Framework Review', dept: 'Legal', spec: 'Jane Auditor' }
        ];

        for (const m of missionObjectives) {
            await Mission.create({
                missionObjective: m.obj,
                tacticalIntelligence: `Standard compliance check for ${m.dept} operations.`,
                protocol: 'GDPR Compliance',
                assignedSpecialist: { name: m.spec, role: m.spec.includes('Auditor') ? 'Auditor' : 'Specialist' },
                threatLevel: 'Medium',
                missionStatus: 'Completed', // Set to completed to show progress in chart
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
        }
        console.log('✅ 11 Sample Missions Created');

        console.log('🚀 Bulk Onboarding Complete!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};
