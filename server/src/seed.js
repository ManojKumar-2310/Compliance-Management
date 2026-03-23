const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Regulation = require('./models/Regulation');
const Task = require('./models/Task');
const bcrypt = require('bcryptjs');

dotenv.config();

const ROLES = [
    "Software Developer", "Network Engineer", "IT Support Engineer", "Cyber Security Analyst",
    "Loan Processing Officer", "KYC Executive", "Finance Executive", "Compliance Executive",
    "Fire Officer", "Safety Inspector", "Emergency Response Staff", "Safety Documentation Officer",
    "Machine Operator", "Production Staff", "Quality Inspector", "Maintenance Technician",
    "Admin Officer", "Lab Technician", "Student Records Officer", "Academic Coordinator",
    "Cloud Architect", "Frontend Developer", "Backend Engineer", "DevOps Engineer",
    "Risk Analyst", "Internal Auditor", "Tax Consultant", "Legal Advisor",
    "Operations Manager", "Supply Chain Coordinator", "Logistics Specialist", "Inventory Controller",
    "HR Manager", "Recruitment Specialist", "Training Coordinator", "Payroll Executive",
    "Marketing Manager", "SEO Specialist", "Content Writer", "Social Media Manager"
];

const NAMES = [
    "Arjun R", "Priya S", "Karthik M", "Divya P", "Rahul T",
    "Sneha V", "Manoj K", "Sanjay L", "Meena R", "Ajith B",
    "Harini K", "Praveen D", "Lavanya G", "Rohit N", "Keerthi S",
    "Naveen P", "Surya V", "Akila T", "Dinesh R", "Swetha M",
    "Vikram C", "Ananya J", "Rohan B", "Ishani W", "Kunal P",
    "Tanvi L", "Aditya G", "Radhika K", "Siddharth S", "Zoya F",
    "Varun M", "Isha D", "Abhishek N", "Maya R", "Rishi V",
    "Aavya H", "Pranav S", "Tara T", "Kabir K", "Myra G"
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

        // Admin
        const admin = await User.create({
            name: 'Admin User',
            email: 'manoj@123.com',
            password: 'manoj@123',
            role: 'Admin',
            department: 'IT',
            designation: 'System Administrator'
        });

        console.log('Admin Created');

        // Create 40+ Personnel
        for (let i = 0; i < NAMES.length; i++) {
            const desig = ROLES[i % ROLES.length];
            let role = 'Employee';

            if (desig.includes('Compliance') || desig.includes('Legal')) role = 'Compliance Officer';
            else if (desig.includes('Manager') || desig.includes('Coordinator') || desig.includes('Lead')) role = 'Manager';
            else if (desig.includes('Auditor') || desig.includes('Inspector')) role = 'Auditor';

            await User.create({
                name: NAMES[i],
                email: `${NAMES[i].toLowerCase().replace(/\s+/g, '.')}@compliance.pro`,
                password: 'password123',
                role: role,
                department: i < 10 ? 'IT' : i < 20 ? 'Operations' : i < 30 ? 'Finance' : 'HR',
                designation: desig
            });
        }

        console.log('Diverse Personnel Created');

        // Create Regulation
        const regulation = await Regulation.create({
            title: 'GDPR Compliance',
            description: 'General Data Protection Regulation standards.',
            category: 'Data Privacy',
            effectiveDate: new Date(),
            currentVersion: '1.0',
            status: 'Active',
            createdBy: admin._id
        });

        console.log('Regulation Created');

        console.log('Data Imported successfully!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};
