/**
 * MongoDB Standalone Test
 *
 * This test verifies MongoDB connections without relying on the Jest setup file
 */

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: "6.0.4",
      downloadDir: "./.cache/mongodb-memory-server/mongodb-binaries",
    },
  });

  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("MongoDB Basic Operations", () => {
  test("should connect successfully", () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  test("should perform CRUD operations", async () => {
    // Create a test model
    const TestModel = mongoose.model(
      "Test",
      new mongoose.Schema({
        name: String,
        value: Number,
      }),
    );

    // Create
    const testDoc = new TestModel({ name: "test", value: 42 });
    await testDoc.save();

    // Read
    const savedDoc = await TestModel.findOne({ name: "test" });
    expect(savedDoc.name).toBe("test");
    expect(savedDoc.value).toBe(42);

    // Update
    savedDoc.value = 100;
    await savedDoc.save();

    const updatedDoc = await TestModel.findOne({ name: "test" });
    expect(updatedDoc.value).toBe(100);

    // Delete
    await TestModel.deleteOne({ name: "test" });
    const deletedDoc = await TestModel.findOne({ name: "test" });
    expect(deletedDoc).toBeNull();
  });
});
