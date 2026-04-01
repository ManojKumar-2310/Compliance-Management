const app = require('./src/app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

// Override default DNS to prevent querySrv ECONNREFUSED errors
dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined in environment variables');
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error details:');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        if (err.reason) {
            console.error('Topology Reason:', JSON.stringify(err.reason, null, 2));
        }
        process.exit(1);
    });

