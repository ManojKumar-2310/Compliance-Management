const mongoose = require('mongoose');
require('dotenv').config();

const testConnect = async () => {
    try {
        console.log('Attempting to connect to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ Success! Connected to MongoDB Atlas');
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to connect:');
        console.error(err);
        process.exit(1);
    }
};

testConnect();
