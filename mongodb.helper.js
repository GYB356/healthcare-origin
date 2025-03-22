/**
 * MongoDB helper for testing
 * This file provides functions to connect to an in-memory MongoDB instance
 * without using Jest's global hooks which can cause test timeouts
 */
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Global variable to track MongoDB instance
let mongoServer = null;

/**
 * Connect to the in-memory database
 */
async function connect() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

/**
 * Close the connection and stop the server
 */
async function closeDatabase() {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

/**
 * Clear all data in the database
 */
async function clearDatabase() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

module.exports = {
  connect,
  closeDatabase,
  clearDatabase,
}; 