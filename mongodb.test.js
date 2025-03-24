/**
 * MongoDB connection test
 *
 * This test file verifies that the MongoDB connection is working correctly
 * and that the connection setup and teardown functions operate as expected.
 */

const mongoose = require("mongoose");
const db = require("./__tests__/helpers/mongodb.setup");

describe("MongoDB Connection", () => {
  beforeAll(async () => {
    await db.connect();
  });

  afterEach(async () => {
    await db.clearDatabase();
  });

  afterAll(async () => {
    await db.closeDatabase();
  });

  test("should connect to the database", async () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  test("should create, read, update and delete documents", async () => {
    // Create a simple test schema and model
    const testSchema = new mongoose.Schema({
      name: String,
      value: Number,
    });

    // Make sure to delete existing model first if it exists
    try {
      mongoose.deleteModel("TestModel");
    } catch (error) {
      // Ignore error if model doesn't exist
    }
    const TestModel = mongoose.model("TestModel", testSchema);

    // Create
    const testDoc = new TestModel({ name: "test", value: 123 });
    await testDoc.save();

    // Read
    const foundDoc = await TestModel.findOne({ name: "test" });
    expect(foundDoc).toBeTruthy();
    expect(foundDoc.name).toBe("test");
    expect(foundDoc.value).toBe(123);

    // Update
    foundDoc.value = 456;
    await foundDoc.save();

    const updatedDoc = await TestModel.findOne({ name: "test" });
    expect(updatedDoc.value).toBe(456);

    // Delete
    await TestModel.deleteOne({ name: "test" });
    const deletedDoc = await TestModel.findOne({ name: "test" });
    expect(deletedDoc).toBeNull();
  });
});
