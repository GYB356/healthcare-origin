/**
 * MongoDB Connection Test
 *
 * Tests MongoDB connection using our improved database helper
 */

const { setupTestDB, clearTestDB, closeTestDB, checkForLeaks } = require("./utils/testDbHelper");
const mongoose = require("mongoose");

describe("MongoDB Connection", () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await checkForLeaks();
    await closeTestDB();
  });

  test("can connect to MongoDB", async () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  test("can perform basic CRUD operations", async () => {
    // Create a test model
    const testSchema = new mongoose.Schema({
      name: String,
      value: Number,
    });

    // Try to delete the model if it exists
    try {
      mongoose.deleteModel("TestModel");
    } catch (e) {
      // Ignore errors if model doesn't exist yet
    }

    const TestModel = mongoose.model("TestModel", testSchema);

    // Create
    const doc = new TestModel({
      name: "test",
      value: 42,
    });

    await doc.save();

    // Read
    const foundDoc = await TestModel.findOne({ name: "test" });
    expect(foundDoc).toBeTruthy();
    expect(foundDoc.name).toBe("test");
    expect(foundDoc.value).toBe(42);

    // Update
    foundDoc.value = 100;
    await foundDoc.save();

    const updatedDoc = await TestModel.findOne({ name: "test" });
    expect(updatedDoc.value).toBe(100);

    // Delete
    await TestModel.deleteOne({ name: "test" });
    const result = await TestModel.findOne({ name: "test" });
    expect(result).toBeNull();
  });
});
