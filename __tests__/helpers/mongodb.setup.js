const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

// Connect to the in-memory database before running tests
beforeAll(async () => {
  // Use a long timeout for this operation (5 minutes)
  jest.setTimeout(300000);
  
  try {
    console.log('Starting MongoDB Memory Server...');
    
    mongod = await MongoMemoryServer.create({
      binary: {
        version: '6.0.4',
        skipMD5: true,
        downloadDir: './.cache/mongodb-memory-server/mongodb-binaries',
      },
      instance: {
        dbName: 'test',
        storageEngine: 'ephemeralForTest', // Use in-memory storage engine
      },
      // Important: increase timeouts and ensure autostart is true
      autoStart: true
    });
    
    const uri = mongod.getUri();
    console.log('Connecting to MongoDB Memory Server at:', uri);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 60000,
      maxPoolSize: 10,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Successfully connected to MongoDB Memory Server');
  } catch (error) {
    console.error('Error setting up MongoDB Memory Server:', error);
    // Try to clean up if there was an error
    if (mongod) {
      try {
        await mongod.stop();
      } catch (stopError) {
        console.error('Error stopping MongoDB after failure:', stopError);
      }
    }
    throw error;
  }
}, 300000); // 5 minute timeout for this hook

// Clear all data between tests
afterEach(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      const collections = await mongoose.connection.db.collections();
      for (const collection of collections) {
        await collection.deleteMany({});
      }
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
}, 60000); // 60 seconds for cleanup 