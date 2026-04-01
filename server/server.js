const app = require('./src/app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

// Override default DNS to prevent querySrv ECONNREFUSED errors
dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });
