const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongod = null;
let connectPromise = null;

/**
 * Connect to the in-memory database with retry logic
 * @param {number} retries - Number of retry attempts
 */
const connect = async (retries = 3) => {
  // If we already have a connection promise, return it
  if (connectPromise) {
    return connectPromise;
  }

  // If we're already connected, just return
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  // Create a new connection promise
  connectPromise = (async () => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Fallback URI in case mongo memory server fails
        let uri = process.env.MONGODB_URI || "mongodb://localhost:27017/test-db";

        // Stop any existing MongoDB instance
        if (mongod) {
          try {
            await mongod.stop();
            console.log("Stopped existing MongoDB Memory Server");
          } catch (stopError) {
            console.warn("Error stopping existing MongoDB Memory Server:", stopError.message);
          }
          mongod = null;
        }

        try {
          // Try to use mongo memory server
          mongod = await MongoMemoryServer.create({
            instance: {
              dbName: "jest-test-db",
              port: 27017,
              // Using random port to avoid conflicts
              port: 27017 + Math.floor(Math.random() * 1000),
            },
            binary: {
              version: "6.0.4",
              downloadDir: "./.cache/mongodb-memory-server/mongodb-binaries",
            },
          });

          uri = mongod.getUri();
          console.log(`Using MongoDB Memory Server (attempt ${attempt}):`, uri);
        } catch (error) {
          console.warn(
            `Failed to create MongoDB Memory Server (attempt ${attempt}), using fallback URI:`,
            uri,
          );
          console.error(error);
        }

        // Close any existing connections
        if (mongoose.connection.readyState !== 0) {
          try {
            await mongoose.connection.close();
            console.log("Closed existing MongoDB connection");
          } catch (error) {
            console.warn("Error closing existing MongoDB connection:", error.message);
          }
        }

        // Set connection options
        const mongooseOpts = {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 30000, // 30 seconds
          socketTimeoutMS: 45000, // 45 seconds
          connectTimeoutMS: 30000, // 30 seconds
        };

        // Connect to database
        await mongoose.connect(uri, mongooseOpts);
        console.log("Connected to MongoDB successfully");

        // Setup connection event handlers
        mongoose.connection.on("error", (e) => {
          console.error("MongoDB connection error:", e);
        });

        // Connection successful, return
        return;
      } catch (error) {
        console.error(`MongoDB setup error on attempt ${attempt}:`, error);

        // If this was the last retry, throw the error
        if (attempt === retries) {
          throw new Error(
            `Failed to connect to MongoDB after ${retries} attempts: ${error.message}`,
          );
        }

        // Wait before retrying (exponential backoff)
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  })().finally(() => {
    // Reset the promise once resolved
    connectPromise = null;
  });

  return connectPromise;
};

/**
 * Drop database, close the connection and stop mongod.
 */
const closeDatabase = async () => {
  try {
    // Check for pending operations before closing
    try {
      // Using internal Mongoose properties carefully
      // @ts-ignore
      const pendingOps = mongoose.connection.db?.s?.topology?.outstandingOperationCount || 0;

      if (pendingOps > 0) {
        console.log(`Waiting for ${pendingOps} pending operations to complete...`);
        await Promise.race([
          // Wait for operations to complete
          new Promise((resolve) => setTimeout(resolve, pendingOps * 100)),
          // Max timeout of 5 seconds
          new Promise((resolve) => setTimeout(resolve, 5000)),
        ]);
      }
    } catch (e) {
      // Ignore errors when checking pending operations
    }

    if (mongoose.connection.readyState !== 0) {
      try {
        await mongoose.connection.dropDatabase();
      } catch (dropError) {
        console.warn("Error dropping database:", dropError.message);
      }

      await mongoose.connection.close(true); // Force close
      console.log("Closed MongoDB connection");
    }

    if (mongod) {
      await mongod.stop({ doCleanup: true, force: true });
      console.log("Stopped MongoDB Memory Server");
      mongod = null;
    }
  } catch (error) {
    console.error("Error closing MongoDB:", error);

    // Force cleanup in case of error
    try {
      if (mongoose.connection.readyState !== 0) {
        mongoose.connection.removeAllListeners();
        await mongoose.disconnect();
      }

      mongod = null;
    } catch (finalError) {
      console.error("Final error during MongoDB cleanup:", finalError);
    }
  }
};

/**
 * Clear all collections in the database.
 */
const clearDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn("MongoDB not connected, attempting to connect before clearing...");
      await connect();
    }

    const collections = mongoose.connection.collections;
    const clearPromises = [];

    for (const key in collections) {
      clearPromises.push(collections[key].deleteMany({}));
    }

    await Promise.all(clearPromises);
    console.log("Cleared all MongoDB collections");
  } catch (error) {
    console.error("Error clearing MongoDB:", error);

    // Try to reconnect and clear if there was an error
    try {
      await closeDatabase();
      await connect();

      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
      console.log("Successfully cleared collections after reconnection");
    } catch (retryError) {
      console.error("Error clearing MongoDB after reconnection:", retryError);
      throw retryError;
    }
  }
};

/**
 * Seed the database with test data
 * @param {Object} data - The data to seed
 */
const seedDatabase = async (data = {}) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn("MongoDB not connected, attempting to connect before seeding...");
      await connect();
    }

    // Only attempt to seed if we have data
    if (Object.keys(data).length === 0) {
      console.log("No seed data provided, skipping database seeding");
      return;
    }

    console.log("Seeding database with test data...");

    // Process each collection in the data object
    for (const [modelName, documents] of Object.entries(data)) {
      // Skip if model doesn't exist
      if (!mongoose.models[modelName]) {
        console.warn(`Model ${modelName} not found, skipping`);
        continue;
      }

      const model = mongoose.model(modelName);

      // Insert many documents or a single one
      if (Array.isArray(documents)) {
        await model.insertMany(documents);
        console.log(`Inserted ${documents.length} documents into ${modelName}`);
      } else {
        await model.create(documents);
        console.log(`Inserted 1 document into ${modelName}`);
      }
    }

    console.log("Database seeding completed");
  } catch (error) {
    console.error("Error seeding database:", error);

    // Try to reconnect and seed if there was an error
    try {
      await closeDatabase();
      await connect();
      return seedDatabase(data); // Retry once
    } catch (retryError) {
      console.error("Error seeding database after reconnection:", retryError);
      throw retryError;
    }
  }
};

/**
 * Check for and cleanup any leaked connections
 */
const checkForLeaks = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      // Check for pending operations
      try {
        // @ts-ignore - Access internal properties
        const pendingQueries = mongoose.connection.db?.s?.topology?.s?.state?.operationCount || 0;

        if (pendingQueries > 0) {
          console.warn(`⚠️ Detected ${pendingQueries} pending database operations before cleanup`);

          // Force cleanup of sessions if possible
          try {
            // @ts-ignore - Access internal properties
            if (mongoose.connection.db?.s?.topology?.s?.sessions) {
              // @ts-ignore - Access internal properties
              for (const session of Object.values(mongoose.connection.db.s.topology.s.sessions)) {
                try {
                  // @ts-ignore - Access internal session to force end it
                  if (session && typeof session.endSession === "function") {
                    // @ts-ignore
                    session.endSession();
                  }
                } catch (e) {
                  // Ignore session errors
                }
              }
            }
          } catch (e) {
            // Ignore session cleanup errors
          }
        }
      } catch (e) {
        // Ignore errors checking for leaks
      }
    }

    // Ensure clean disconnect
    await closeDatabase();

    // Extra cleanup for memory management
    if (global.gc) {
      global.gc(); // Force garbage collection if available
    }
  } catch (error) {
    console.error("Error checking for leaks:", error);

    // Force final cleanup
    try {
      if (mongoose.connection.readyState !== 0) {
        mongoose.connection.removeAllListeners();
        await mongoose.disconnect();
      }
      mongod = null;
    } catch (e) {
      // Ignore final cleanup errors
    }
  }
};

// Connect to database before tests start
connect()
  .then(() => {
    console.log("MongoDB setup completed successfully");
  })
  .catch((error) => {
    console.error("MongoDB setup failed:", error);
  });

// Close database connection after tests finish
afterAll(async () => {
  await checkForLeaks();
});

// Make helpers available globally
global.mongoTestUtils = {
  connect,
  closeDatabase,
  clearDatabase,
  seedDatabase,
  checkForLeaks,
};

module.exports = {
  connect,
  closeDatabase,
  clearDatabase,
  seedDatabase,
  checkForLeaks,
  mongod,
};
