const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await User.countDocuments();
        const activeCount = await User.countDocuments({ isActive: true });
        console.log('Total Users in DB:', count);
        console.log('Active Users in DB:', activeCount);
        const users = await User.find().select('name role isActive');
        console.log('User Details:', JSON.stringify(users, null, 2));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
