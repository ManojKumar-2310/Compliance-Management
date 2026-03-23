console.log('Starting checkAdmin script...');
const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const admin = await User.findOne({ email: 'manoj@123.com' });
        if (admin) {
            console.log('Admin found:', admin);
            console.log('Password hash:', admin.password);
            console.log('Is Active:', admin.isActive);
            const bcrypt = require('bcryptjs');
            const isMatch = await bcrypt.compare('manoj@123', admin.password);
            console.log('Password Match for "manoj@123":', isMatch);
        } else {
            console.log('Admin NOT found');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkAdmin();
