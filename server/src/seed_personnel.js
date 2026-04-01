const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Regulation = require('./models/Regulation');
const path = require('path');

const dotenvPath = path.join(__dirname, '../.env');
console.log('Loading .env from:', dotenvPath);
dotenv.config({ path: dotenvPath });

console.log('MONGO_URI found:', process.env.MONGO_URI ? 'YES' : 'NO');
if (!process.env.MONGO_URI) {
    console.error('CRITICAL: MONGO_URI is not defined in .env');
    process.exit(1);
}

const roles = [
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

const names = [
    "Arjun R", "Priya S", "Karthik M", "Divya P", "Rahul T",
    "Sneha V", "Manoj K", "Sanjay L", "Meena R", "Ajith B",
    "Harini K", "Praveen D", "Lavanya G", "Rohit N", "Keerthi S",
    "Naveen P", "Surya V", "Akila T", "Dinesh R", "Swetha M",
    "Vikram C", "Ananya J", "Rohan B", "Ishani W", "Kunal P",
    "Tanvi L", "Aditya G", "Radhika K", "Siddharth S", "Zoya F",
    "Varun M", "Isha D", "Abhishek N", "Maya R", "Rishi V",
    "Aavya H", "Pranav S", "Tara T", "Kabir K", "Myra G"
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for Real Personnel Seeding');

        // 1. Create/Update Admin
        const adminEmail = 'manoj@123.com';
        const adminData = {
            name: 'Cheran Admin',
            email: adminEmail,
            password: 'manoj@123', // Admin password strategy
            role: 'Admin',
            department: 'Management',
            designation: 'System Administrator',
            isActive: true
        };

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            existingAdmin.password = adminData.password;
            await existingAdmin.save();
            console.log('Admin updated with new credentials.');
        } else {
            await User.create(adminData);
            console.log('Admin created with new credentials.');
        }

        // 2. Onboard 40 Personnel with Diversified Roles and Individual Credentials
        console.log('Starting personnel onboarding...');
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const firstName = name.split(' ')[0].toLowerCase();
            const lastName = name.includes(' ') ? name.split(' ')[1].toLowerCase() : '';

            // Generate unique email and password
            const email = lastName ? `${firstName}.${lastName}@compliance.pro` : `${firstName}@compliance.pro`;
            const password = `${firstName}@123`; // Individual password strategy

            // Determine logical role based on designation
            let role = 'Employee';
            const desig = roles[i % roles.length];

            if (desig.includes('Compliance') || desig.includes('Legal')) role = 'Compliance Officer';
            else if (desig.includes('Manager') || desig.includes('Coordinator') || desig.includes('Lead')) role = 'Manager';
            else if (desig.includes('Auditor') || desig.includes('Inspector')) role = 'Auditor';
            else if (desig.includes('Admin')) role = 'Admin';

            const userData = {
                name: name,
                email: email,
                password: password,
                role: role,
                department: [
                    'Healthcare / Medical', 'Education', 'Banking', 'Finance', 'Insurance',
                    'Information Technology (IT)', 'Software Companies', 'Manufacturing',
                    'Pharmaceutical', 'Construction'
                ][Math.floor(i / 4)],
                designation: desig,
                isActive: true
            };

            const userExists = await User.findOne({ email: userData.email });
            if (!userExists) {
                await User.create(userData);
                console.log(`Onboarded: ${userData.name} [${role}] - Email: ${email} | Pwd: ${password}`);
            } else {
                // Update existing user credentials and role
                userExists.password = userData.password;
                userExists.role = role;
                userExists.designation = desig;
                await userExists.save();
                console.log(`Updated Credentials: ${userData.name} [${role}] - Pwd: ${password}`);
            }
        }

        // 3. Seed Diverse Regulations for Mission Protocols
        console.log('Seeding strategic regulations...');
        const regulationProtocols = [
            { title: 'GDPR Directive 01', description: 'General Data Protection Regulation standards for personal data integrity.', category: 'Data Privacy' },
            { title: 'HIPAA Protocol 7', description: 'Health Insurance Portability and Accountability Act security rules.', category: 'Healthcare' },
            { title: 'ISO 27001 Standard', description: 'Information security management system requirements.', category: 'Security' },
            { title: 'SOC2 Type II', description: 'Trust Service Criteria for security, availability, and confidentiality.', category: 'Infrastructure' },
            { title: 'PCI-DSS v4.0', description: 'Payment Card Industry Data Security Standard for transactional integrity.', category: 'Finance' }
        ];

        for (const reg of regulationProtocols) {
            const exists = await Regulation.findOne({ title: reg.title });
            if (!exists) {
                await Regulation.create({
                    ...reg,
                    effectiveDate: new Date(),
                    currentVersion: '1.0',
                    status: 'Active',
                    createdBy: adminData._id || (await User.findOne({ role: 'Admin' }))._id
                });
                console.log(`Declassified Protocol: ${reg.title}`);
            }
        }

        console.log('Personnel & Regulation Seeding SUCCESSFUL!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
