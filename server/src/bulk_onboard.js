const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const Department = require('./models/Department');

dotenv.config({ path: path.join(__dirname, '../.env') });

const employees = [
    { name: "Arjun R", email: "arjun@123.com", password: "arjun@123", unit: "IT & Security", designation: "Software Engineer" },
    { name: "Priya S", email: "priya@123.com", password: "priya@123", unit: "Finance", designation: "Accounts Manager" },
    { name: "Karthik M", email: "karthik@123.com", password: "karthik@123", unit: "Operations", designation: "Supply Chain Lead" },
    { name: "Divya P", email: "divya@123.com", password: "divya@123", unit: "Human Resources", designation: "Recruitment Specialist" },
    { name: "Rahul T", email: "rahul@123.com", password: "rahul@123", unit: "Legal", designation: "Compliance Officer" },
    { name: "Sneha V", email: "sneha@123.com", password: "sneha@123", unit: "IT & Security", designation: "Network Admin" },
    { name: "Manoj K", email: "manoj@123.com", password: "manoj@123", unit: "Finance", designation: "Financial Analyst" },
    { name: "Sanjay L", email: "sanjay@123.com", password: "sanjay@123", unit: "Operations", designation: "Shift Supervisor" },
    { name: "Meena R", email: "meena@123.com", password: "meena@123", unit: "Human Resources", designation: "HR Coordinator" },
    { name: "Ajith B", email: "ajith@123.com", password: "ajith@123", unit: "Legal", designation: "Legal Consultant" },
    { name: "Harini K", email: "harini@123.com", password: "harini@123", unit: "IT & Security", designation: "Cybersecurity Analyst" },
    { name: "Praveen D", email: "praveen@123.com", password: "praveen@123", unit: "Finance", designation: "Tax Accountant" },
    { name: "Lavanya G", email: "lavanya@123.com", password: "lavanya@123", unit: "Operations", designation: "Logistics Coordinator" },
    { name: "Rohit N", email: "rohit@123.com", password: "rohit@123", unit: "Human Resources", designation: "Payroll Specialist" },
    { name: "Keerthi S", email: "keerthi@123.com", password: "keerthi@123", unit: "Legal", designation: "Risk Manager" },
    { name: "Naveen P", email: "naveen@123.com", password: "naveen@123", unit: "IT & Security", designation: "DevOps Engineer" },
    { name: "Surya V", email: "surya@123.com", password: "surya@123", unit: "Finance", designation: "Auditor" },
    { name: "Akila T", email: "akila@123.com", password: "akila@123", unit: "Operations", designation: "Quality Inspector" },
    { name: "Dinesh R", email: "dinesh@123.com", password: "dinesh@123", unit: "Human Resources", designation: "Benefits Admin" },
    { name: "Swetha M", email: "swetha@123.com", password: "swetha@123", unit: "Legal", designation: "Contract Specialist" }
];

const onboard = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const departments = await Department.find();
        const deptMap = {};
        departments.forEach(d => { deptMap[d.name] = d._id; });

        for (const emp of employees) {
            const userExists = await User.findOne({ email: emp.email });
            if (userExists) {
                console.log(`⚠️ User ${emp.email} already exists, skipping...`);
                continue;
            }

            const deptId = deptMap[emp.unit] || departments[0]._id; // Default to first if not found

            await User.create({
                name: emp.name,
                email: emp.email,
                password: emp.password,
                role: 'Employee',
                department: deptId,
                designation: emp.designation
            });
            console.log(`👤 Onboarded: ${emp.name} (${emp.unit})`);
        }

        console.log('\n🚀 Bulk Onboarding Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error onboarding employees:', error);
        process.exit(1);
    }
};

onboard();
