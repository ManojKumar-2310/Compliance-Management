const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'auditor@123' });
        if (user) {
            console.log('✅ User found:', user.email, 'Role:', user.role);
        } else {
            console.log('❌ User NOT found: auditor@123');
            const allUsers = await User.find({}, 'email role');
            console.log('Current users:', allUsers);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

checkUser();
