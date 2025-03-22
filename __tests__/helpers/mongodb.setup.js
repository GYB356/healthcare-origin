const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

// Connect to the in-memory database before running tests
beforeAll(async () => {
  jest.setTimeout(120000); // Increase Jest timeout to 120 seconds for this setup
  
  try {
    console.log('Starting MongoDB Memory Server...');
    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'jest',
      },
      binary: {
        version: '6.0.4',
        skipMD5: true
      }
    });
    const uri = mongod.getUri();
    console.log('Connecting to MongoDB Memory Server at:', uri);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 60000,
      maxPoolSize: 10
    });
    console.log('Successfully connected to MongoDB Memory Server');
  } catch (error) {
    console.error('Error setting up MongoDB Memory Server:', error);
    // Try to clean up if there was an error
    if (mongod) {
      await mongod.stop().catch(console.error);
    }
    throw error;
  }
}, 120000); // Increase timeout to 120 seconds for this hook

// Clear all data between tests
afterEach(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      const collections = await mongoose.connection.db.collections();
      await Promise.all(collections.map(collection => collection.deleteMany({})));
    }
  } catch (error) {
    console.error('Error clearing collections:', error);
  }
});

// Close database connection after all tests
afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Closed MongoDB connection');
    }
    if (mongod) {
      await mongod.stop();
      console.log('Stopped MongoDB Memory Server');
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
}, 60000); // Give 60 seconds for cleanup 