const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// 1. Connect to the in-memory database before running any tests
module.exports.connect = async () => {
    // Close any existing connection to prevent errors
    await mongoose.disconnect();
    
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    await mongoose.connect(uri);
};

// 2. Clear the database after each test (so tests don't affect each other)
module.exports.clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
};

// 3. Disconnect and stop the server after all tests are done
module.exports.closeDatabase = async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
};