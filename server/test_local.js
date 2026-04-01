const { MongoClient } = require('mongodb');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/cms_db';

async function testLocal() {
    try {
        console.log('Connecting to local database:', LOCAL_URI);
        const client = new MongoClient(LOCAL_URI, { serverSelectionTimeoutMS: 2000 });
        await client.connect();
        console.log('✅ Success! Local MongoDB is reachable.');
        const db = client.db();
        const collections = await db.listCollections().toArray();
        console.log('Found collections:', collections.map(c => c.name));
        await client.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Local MongoDB connection failed:');
        console.error(err.message);
        process.exit(1);
    }
}

testLocal();
