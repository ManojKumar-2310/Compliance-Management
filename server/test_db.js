const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

console.log('Testing connection to:', MONGO_URI);

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('SUCCESS: Connected to MongoDB');
        process.exit(0);
    })
    .catch((err) => {
        console.error('FAILURE: MongoDB connection error');
        console.error('Name:', err.name);
        console.error('Message:', err.message);
        process.exit(1);
    });

// Timeout after 15 seconds
setTimeout(() => {
    console.error('TIMEOUT: Connection took too long');
    process.exit(1);
}, 15000);
