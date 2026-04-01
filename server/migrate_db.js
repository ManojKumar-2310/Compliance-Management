const { MongoClient } = require('mongodb');

// Local database URI
const LOCAL_URI = 'mongodb://127.0.0.1:27017/cms_db';

// Remote Atlas database URI 
const REMOTE_URI = 'mongodb+srv://manojmahi9626_db_user:manomahi9626@cluster0.no3plf8.mongodb.net/cms_db?appName=Cluster0';

async function migrate() {
    console.log('Starting migration from local to MongoDB Atlas...');
    let localClient, remoteClient;
    try {
        console.log('Connecting to local database...');
        localClient = new MongoClient(LOCAL_URI);
        await localClient.connect();
        
        console.log('Connecting to remote Atlas database...');
        remoteClient = new MongoClient(REMOTE_URI);
        await remoteClient.connect();
        
        console.log('Connected to both databases successfully.');

        const localDb = localClient.db();
        const remoteDb = remoteClient.db();

        const collections = await localDb.listCollections().toArray();
        console.log(`Found ${collections.length} collections to migrate.`);

        for (let collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            if (collectionName.startsWith('system.')) continue;
            
            console.log(`Migrating collection: ${collectionName}`);
            
            const localCollection = localDb.collection(collectionName);
            const remoteCollection = remoteDb.collection(collectionName);

            // Fetch all documents from local
            const docs = await localCollection.find({}).toArray();
            
            if (docs.length > 0) {
                // optional: drop existing remote data to prevent duplication during migration
                try {
                    await remoteCollection.deleteMany({});
                } catch(err) {
                    console.log(`Wait: `, err.message);
                }

                await remoteCollection.insertMany(docs);
                console.log(`  -> Successfully transferred ${docs.length} documents for ${collectionName}.`);
            } else {
                console.log(`  -> Local collection ${collectionName} was empty. Skipped.`);
            }
        }

        console.log('Migration completed successfully! 🎉');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        if (localClient) await localClient.close();
        if (remoteClient) await remoteClient.close();
        process.exit();
    }
}

migrate();
