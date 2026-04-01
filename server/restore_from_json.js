const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

// Override default DNS to prevent querySrv ECONNREFUSED errors
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

require('dotenv').config();

// Function to recursively convert MongoDB Extended JSON to regular objects
function convertExtendedJson(obj) {
    if (Array.isArray(obj)) {
        return obj.map(convertExtendedJson);
    } else if (obj !== null && typeof obj === 'object') {
        if (obj.$oid) return new mongoose.Types.ObjectId(obj.$oid);
        if (obj.$date) return new Date(obj.$date);
        
        const newObj = {};
        for (const [key, value] of Object.entries(obj)) {
            newObj[key] = convertExtendedJson(value);
        }
        return newObj;
    }
    return obj;
}

async function restore() {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        console.error('MONGO_URI not found in .env');
        process.exit(1);
    }

    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Connected successfully!');

        const files = [
            { name: 'departments', file: 'cms_db.departments.json' },
            { name: 'users', file: 'cms_db.users.json' },
            { name: 'regulations', file: 'cms_db.regulations.json' },
            { name: 'tasks', file: 'cms_db.tasks.json' },
            { name: 'documents', file: 'cms_db.documents.json' },
            { name: 'missions', file: 'cms_db.missions.json' },
            { name: 'refreshtokens', file: 'cms_db.refreshtokens.json' }
        ];

        for (const f of files) {
            const filePath = path.join(__dirname, f.file);
            if (!fs.existsSync(filePath)) {
                console.warn(`⚠️  File not found: ${f.file}, skipping...`);
                continue;
            }

            console.log(`Restoring collection: ${f.name}...`);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const processedData = convertExtendedJson(data);

            const db = mongoose.connection.db;
            const collection = db.collection(f.name);

            // Optional: Clear existing data in the collection first
            await collection.deleteMany({});
            
            if (processedData.length > 0) {
                await collection.insertMany(processedData);
                console.log(`  -> Restored ${processedData.length} records to ${f.name}.`);
            } else {
                console.log(`  -> ${f.name} was empty.`);
            }
        }

        console.log('\n✨ All data successfully restored to MongoDB Atlas!');
    } catch (err) {
        console.error('❌ Restoration failed:');
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

restore();
