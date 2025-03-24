/**
 * This script downloads MongoDB binaries in advance to avoid timeout issues during tests
 */
const { MongoMemoryServer } = require("mongodb-memory-server");

async function downloadMongoBinary() {
  console.log("Downloading MongoDB binary for testing...");

  // Use MongoBinaryDownload directly instead of starting the server
  const binaryOpts = {
    version: "6.0.4",
    downloadDir: "./.cache/mongodb-memory-server/mongodb-binaries",
    platform: process.platform,
    arch: process.arch,
    checkMD5: false,
  };

  console.log("Using MongoDB binary options:", binaryOpts);

  try {
    // This will download the binary without starting the server
    console.log("Starting download...");
    const MongoBinary = require("mongodb-memory-server-core").MongoBinary;
    const downloadPath = await MongoBinary.getPath(binaryOpts);
    console.log("MongoDB binary download complete. Binary path:", downloadPath);

    // Verify the binary by creating a server instance but not starting it
    const mongod = new MongoMemoryServer({
      instance: { dbName: "test-verify-binary" },
      binary: binaryOpts,
    });

    // Clean up the instance
    await mongod.ensureInstance();
    console.log("MongoDB binary verification successful.");
    await mongod.stop();

    console.log("MongoDB setup done. You can now run your tests.");
    return downloadPath;
  } catch (err) {
    console.error("Failed to download MongoDB binary:", err);
    throw err;
  }
}

downloadMongoBinary().catch((err) => {
  console.error("Error in download script:", err);
  process.exit(1);
});
