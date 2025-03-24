/**
 * MongoDB helper for testing
 * This file provides functions to connect to an in-memory MongoDB instance
 * without using Jest's global hooks which can cause test timeouts
 */
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Global variable to track MongoDB instance
let mongoServer = null;

/**
 * Connect to the in-memory database with retry logic
 */
async function connect(retries = 3) {
  try {
    if (!mongoServer) {
      mongoServer = await MongoMemoryServer.create({
        binary: {
          version: "6.0.4",
          downloadDir: "./.cache/mongodb-memory-server/mongodb-binaries",
        },
        instance: {
          storageEngine: "wiredTiger",
          args: ["--quiet", "--nojournal"],
        },
        autoStart: false,
      });
    }

    // Start the server if it's not already running
    if (!mongoServer.instanceInfo) {
      await mongoServer.start();
    }

    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });

    console.log(`Connected to MongoDB memory server at ${uri}`);
    return true;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);

    if (retries > 0) {
      console.log(`Retrying connection (${retries} attempts left)...`);

      // Clean up any failed server
      if (mongoServer) {
        try {
          await mongoServer.stop();
        } catch (stopError) {
          console.error(`Error stopping MongoDB server: ${stopError.message}`);
        }
        mongoServer = null;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return connect(retries - 1);
    }

    console.error("Failed to connect to MongoDB after multiple attempts");
    throw error;
  }
}

/**
 * Close the connection and stop the server
 */
async function closeDatabase() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("Mongoose connection closed");
    }

    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
      console.log("MongoDB memory server stopped");
    }
  } catch (error) {
    console.error(`Error closing database: ${error.message}`);
    // Force cleanup even if there's an error
    mongoServer = null;
  }
}

/**
 * Clear all data in the database
 */
async function clearDatabase() {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    console.log("Database cleared");
  } catch (error) {
    console.error(`Error clearing database: ${error.message}`);
    throw error;
  }
}

module.exports = {
  connect,
  closeDatabase,
  clearDatabase,
};
