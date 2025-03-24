/**
 * Test Database Helper
 *
 * Provides utilities for connecting to, seeding, and cleaning up MongoDB
 * during test execution to ensure reliable test runs.
 * Supports both real MongoDB and in-memory MongoDB based on environment variables.
 */
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { User } from "@/types/User";
import { Appointment, AppointmentStatus } from "@/types/Appointment";
import { Message } from "@/types/Message";

// Configuration
const MONGO_TIMEOUT = process.env.MONGO_TIMEOUT ? parseInt(process.env.MONGO_TIMEOUT) : 60000; // 60 seconds timeout
const MONGO_BINARY_VERSION = process.env.MONGO_BINARY_VERSION || "6.0.4";
const LOCAL_BINARY_PATH = "./.cache/mongodb-memory-server/mongodb-binaries";

// Environment variables
const USE_REAL_MONGODB = process.env.USE_REAL_MONGODB === "true";
const MONGO_URI_TEST = process.env.MONGO_URI_TEST || "mongodb://localhost:27017/healthcare-test";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "healthcare-test";

// Connection variables
let mongoServer: MongoMemoryServer | null = null;
let isConnected = false;
let connectionPromise: Promise<boolean> | null = null;

// Log configuration for debugging
console.log(`MongoDB Test Configuration:
- Using Real MongoDB: ${USE_REAL_MONGODB}
- MongoDB URI: ${USE_REAL_MONGODB ? MONGO_URI_TEST : "In-memory"}
- MongoDB Timeout: ${MONGO_TIMEOUT}ms
- MongoDB Binary Version: ${MONGO_BINARY_VERSION}
`);

// Default test data for seeding
const defaultUsers: Partial<User>[] = [
  {
    id: "test-patient-1",
    name: "Test Patient",
    email: "patient@test.com",
    role: "patient",
  },
  {
    id: "test-doctor-1",
    name: "Dr. Test",
    email: "doctor@test.com",
    role: "doctor",
    specialization: "General Medicine",
  },
  {
    id: "test-admin-1",
    name: "Admin User",
    email: "admin@test.com",
    role: "admin",
  },
];

const defaultAppointments: Partial<Appointment>[] = [
  {
    id: "test-appt-1",
    patientId: "test-patient-1",
    doctorId: "test-doctor-1",
    date: new Date("2025-05-15T10:00:00"),
    duration: 30,
    status: AppointmentStatus.SCHEDULED,
    reason: "Regular checkup",
  },
];

const defaultMessages: Partial<Message>[] = [
  {
    id: "test-msg-1",
    senderId: "test-patient-1",
    recipientId: "test-doctor-1",
    content: "Hello doctor, I have a question.",
    timestamp: new Date("2025-05-14T15:30:00"),
    read: false,
  },
];

/**
 * Connect to MongoDB with retry logic
 * Support both in-memory and real MongoDB based on environment variables
 */
export const setupTestDB = async (maxRetries = 3): Promise<boolean> => {
  // If already connected, return
  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  // If a connection attempt is already in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  // Create a new connection attempt
  connectionPromise = (async () => {
    try {
      let uri = MONGO_URI_TEST;

      // If using in-memory MongoDB
      if (!USE_REAL_MONGODB) {
        // If there's an existing server but we're not connected, stop it
        if (mongoServer && !isConnected) {
          try {
            await mongoServer.stop();
            mongoServer = null;
          } catch (stopError) {
            console.warn(
              `Warning: Could not stop existing mongo server: ${stopError instanceof Error ? stopError.message : String(stopError)}`,
            );
          }
        }

        // Configure MongoDB Memory Server
        console.log("Starting MongoDB Memory Server...");
        mongoServer = await MongoMemoryServer.create({
          binary: {
            version: MONGO_BINARY_VERSION,
            downloadDir: LOCAL_BINARY_PATH,
          },
          instance: {
            storageEngine: "wiredTiger",
            args: ["--quiet", "--nojournal"],
            // Use random port to avoid conflicts
            port: 27017 + Math.floor(Math.random() * 1000),
          },
        });

        // Start MongoDB with a custom timeout
        await new Promise<void>((resolve, reject) => {
          const startTimeout = setTimeout(() => {
            reject(new Error(`MongoDB startup timed out after ${MONGO_TIMEOUT}ms`));
          }, MONGO_TIMEOUT);

          // Check if already started (for compatibility with v8+)
          if (mongoServer?.instanceInfo) {
            clearTimeout(startTimeout);
            resolve();
            return;
          }

          mongoServer!
            .start()
            .then(() => {
              clearTimeout(startTimeout);
              resolve();
            })
            .catch((err) => {
              clearTimeout(startTimeout);
              reject(err);
            });
        });

        uri = mongoServer.getUri();
        console.log(`Using MongoDB Memory Server at: ${uri}`);
      } else {
        console.log(`Using real MongoDB at: ${uri}`);
      }

      // Close any existing connections
      if (mongoose.connection.readyState !== 0) {
        try {
          await mongoose.connection.close();
          console.log("Closed existing mongoose connection");
        } catch (closeError) {
          console.warn(
            `Warning: Error closing existing connection: ${closeError instanceof Error ? closeError.message : String(closeError)}`,
          );
        }
      }

      // Configure Mongoose connection with timeouts
      await mongoose.connect(uri, {
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 30000,
      });

      // Set up event listeners for connection issues
      mongoose.connection.on("error", (error) => {
        console.error(
          `MongoDB connection error: ${error instanceof Error ? error.message : String(error)}`,
        );
        isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected. Will attempt to reconnect on next test.");
        isConnected = false;
      });

      isConnected = true;
      console.log(`Connected to MongoDB at ${uri}`);

      // If using real MongoDB, clear the database to start with clean state
      if (USE_REAL_MONGODB) {
        await clearTestDB();
      }

      return true;
    } catch (error) {
      console.error(
        `Failed to connect to MongoDB: ${error instanceof Error ? error.message : String(error)}`,
      );

      if (maxRetries > 0) {
        console.log(`Retrying connection (${maxRetries} attempts left)...`);

        // Clean up any failed server
        if (!USE_REAL_MONGODB && mongoServer) {
          try {
            await mongoServer.stop();
          } catch (stopError) {
            console.error(
              `Error stopping MongoDB server: ${stopError instanceof Error ? stopError.message : String(stopError)}`,
            );
          }
          mongoServer = null;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Reset connection promise
        connectionPromise = null;

        // Retry recursively
        return setupTestDB(maxRetries - 1);
      }

      throw new Error("Failed to connect to MongoDB after multiple attempts");
    } finally {
      // Clear the connection promise once done
      connectionPromise = null;
    }
  })();

  return connectionPromise;
};

/**
 * Close database connections and clean up resources
 */
export const closeTestDB = async (): Promise<void> => {
  try {
    // First, let any pending operations complete
    if (mongoose.connection.db) {
      try {
        // Safely access potentially internal properties
        // @ts-ignore - We need to access internal properties to check for pending operations
        const pendingOps = mongoose.connection.db.s?.topology?.outstandingOperationCount || 0;

        if (pendingOps > 0) {
          console.log(`Waiting for ${pendingOps} pending operations to complete...`);

          // Wait with a timeout for operations to complete
          await Promise.race([
            Promise.all(
              Array.from(
                { length: pendingOps },
                (_, i) => new Promise((resolve) => setTimeout(resolve, 100 * i)),
              ),
            ),
            new Promise((resolve) => setTimeout(resolve, 5000)), // 5 second max timeout
          ]);
        }
      } catch (err) {
        console.warn("Error checking for pending operations:", err);
      }
    }

    // Close mongoose connection if open
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.connection.close(true); // Force close
      console.log("Mongoose connection closed");
    }

    // Stop MongoDB memory server if running
    if (!USE_REAL_MONGODB && mongoServer) {
      await mongoServer.stop({ doCleanup: true, force: true });
      mongoServer = null;
      console.log("MongoDB memory server stopped");
    }

    isConnected = false;
  } catch (error) {
    console.error(
      `Error closing database: ${error instanceof Error ? error.message : String(error)}`,
    );

    // Force cleanup even if there's an error
    mongoServer = null;

    // Try the harshest cleanup if normal close fails
    try {
      mongoose.connection.removeAllListeners();
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error(
        `Additional error during disconnect: ${disconnectError instanceof Error ? disconnectError.message : String(disconnectError)}`,
      );
    }

    isConnected = false;
  }
};

/**
 * Clear all collections from the database
 */
export const clearTestDB = async (): Promise<void> => {
  try {
    if (!isConnected || mongoose.connection.readyState !== 1) {
      console.warn("Cannot clear database: not connected");
      await setupTestDB();
    }

    const collections = mongoose.connection.collections;
    const clearPromises = [];

    for (const key in collections) {
      clearPromises.push(collections[key].deleteMany({}));
    }

    await Promise.all(clearPromises);
    console.log("Test database cleared");
  } catch (error) {
    console.error(
      `Error clearing database: ${error instanceof Error ? error.message : String(error)}`,
    );

    // If we can't clear, reconnect and then try again
    try {
      await closeTestDB();
      await setupTestDB();
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    } catch (retryError) {
      console.error(
        `Failed to clear database on retry: ${retryError instanceof Error ? retryError.message : String(retryError)}`,
      );
      throw retryError;
    }
  }
};

/**
 * Seed the database with test data
 * @param options Configuration options for seeding
 */
export const seedTestDB = async (
  options: {
    users?: boolean;
    appointments?: boolean;
    messages?: boolean;
    customData?: {
      users?: Partial<User>[];
      appointments?: Partial<Appointment>[];
      messages?: Partial<Message>[];
    };
  } = {},
): Promise<void> => {
  try {
    if (!isConnected || mongoose.connection.readyState !== 1) {
      await setupTestDB();
    }

    const { users = true, appointments = true, messages = true, customData = {} } = options;

    // Seed users if requested
    if (users) {
      try {
        const userData = customData.users || defaultUsers;
        const UserModel =
          mongoose.models.User ||
          mongoose.model(
            "User",
            new mongoose.Schema({
              id: String,
              name: String,
              email: String,
              role: String,
              specialization: String,
            }),
          );
        await UserModel.insertMany(userData);
        console.log(`Seeded ${userData.length} test users`);
      } catch (userError) {
        console.error(
          `Error seeding users: ${userError instanceof Error ? userError.message : String(userError)}`,
        );
      }
    }

    // Seed appointments if requested
    if (appointments) {
      try {
        const appointmentData = customData.appointments || defaultAppointments;
        const AppointmentModel =
          mongoose.models.Appointment ||
          mongoose.model(
            "Appointment",
            new mongoose.Schema({
              id: String,
              patientId: String,
              doctorId: String,
              date: Date,
              duration: Number,
              status: String,
              reason: String,
            }),
          );
        await AppointmentModel.insertMany(appointmentData);
        console.log(`Seeded ${appointmentData.length} test appointments`);
      } catch (appointmentError) {
        console.error(
          `Error seeding appointments: ${appointmentError instanceof Error ? appointmentError.message : String(appointmentError)}`,
        );
      }
    }

    // Seed messages if requested
    if (messages) {
      try {
        const messageData = customData.messages || defaultMessages;
        const MessageModel =
          mongoose.models.Message ||
          mongoose.model(
            "Message",
            new mongoose.Schema({
              id: String,
              senderId: String,
              recipientId: String,
              content: String,
              timestamp: Date,
              read: Boolean,
            }),
          );
        await MessageModel.insertMany(messageData);
        console.log(`Seeded ${messageData.length} test messages`);
      } catch (messageError) {
        console.error(
          `Error seeding messages: ${messageError instanceof Error ? messageError.message : String(messageError)}`,
        );
      }
    }

    console.log("Test database seeded successfully");
  } catch (error) {
    console.error(
      `Error seeding database: ${error instanceof Error ? error.message : String(error)}`,
    );
    // Try to reconnect and retry once
    try {
      await closeTestDB();
      await setupTestDB();
      // Then recursively call this function again
      await seedTestDB(options);
    } catch (retryError) {
      console.error(
        `Failed to seed database on retry: ${retryError instanceof Error ? retryError.message : String(retryError)}`,
      );
      throw retryError;
    }
  }
};

/**
 * Get test data fixtures for use in tests
 */
export const getTestFixtures = () => ({
  users: defaultUsers,
  appointments: defaultAppointments,
  messages: defaultMessages,
});

/**
 * Force-reconnect to the database if the connection was dropped
 */
export const ensureConnection = async (): Promise<void> => {
  if (!isConnected || mongoose.connection.readyState !== 1) {
    console.log("Database connection lost or not established. Reconnecting...");
    await setupTestDB();
  }
};

/**
 * Check for leaking connections and clean them up
 */
export const checkForLeaks = async (): Promise<void> => {
  try {
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      try {
        // @ts-ignore - We need to access internal properties to check for pending operations
        const pendingQueries = mongoose.connection.db?.s?.topology?.s?.state?.operationCount || 0;

        if (pendingQueries > 0) {
          console.warn(`⚠️ Detected ${pendingQueries} pending database operations before cleanup`);

          // Force cleanup of these operations if possible
          try {
            // @ts-ignore - We need to access internal properties for cleanup
            if (mongoose.connection.db?.s?.topology?.s?.sessions) {
              // @ts-ignore - We need to access internal properties for cleanup
              for (const session of Object.values(mongoose.connection.db.s.topology.s.sessions)) {
                try {
                  // @ts-ignore - Access internal session to force end it
                  if (session && typeof session.endSession === "function") {
                    // @ts-ignore
                    session.endSession();
                  }
                } catch (e) {
                  console.error("Error ending session:", e);
                }
              }
            }
          } catch (err) {
            console.warn("Error cleaning up sessions:", err);
          }
        }
      } catch (err) {
        console.warn("Error checking for leaks:", err);
      }
    }

    // Always ensure clean disconnect
    await closeTestDB();

    // Additional cleanup for any leaked connections
    if (global.gc) {
      global.gc(); // Force garbage collection if available
    }
  } catch (error) {
    console.error(
      `Error checking for leaks: ${error instanceof Error ? error.message : String(error)}`,
    );

    // Force final cleanup
    try {
      if (mongoose.connection) {
        mongoose.connection.removeAllListeners();
        await mongoose.disconnect();
      }
      mongoServer = null;
      isConnected = false;
    } catch (e) {
      // Last resort - suppress any final errors
    }
  }
};
