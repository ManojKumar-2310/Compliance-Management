const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await User.countDocuments();
        const activeCount = await User.countDocuments({ isActive: true });
        console.log(`Total Users: ${count}`);
        console.log(`Active Users: ${activeCount}`);
        const users = await User.find().select('name email role isActive');
        console.log('Users in DB:', JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

checkUsers();
