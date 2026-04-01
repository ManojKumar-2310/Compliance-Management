const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('CONNECTED TO MONGO');
        const users = await User.find({}, 'email role name');
        console.log('USERS IN DB:', JSON.stringify(users, null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error('CONNECTION ERROR:', err);
        process.exit(1);
    });
