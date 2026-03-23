const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const checkEmployee = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Check for Arjun R
        const email = 'arjun.r@compliance.pro';
        const user = await User.findOne({ email });

        if (user) {
            console.log('User found:', user.name);
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('Is Active:', user.isActive);

            // Test password
            const password = 'arjun@123';
            const isMatch = await bcrypt.compare(password, user.password);
            console.log(`Password Match for "${password}":`, isMatch);
        } else {
            console.log('User NOT found:', email);
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkEmployee();
