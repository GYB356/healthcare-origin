/**
 * MongoDB Binary Fix Script - Version 2.0
 *
 * This script helps resolve common issues with MongoDB memory server binaries:
 * 1. Ensures binaries are properly downloaded
 * 2. Handles version compatibility with mongodb-memory-server v7/v8+
 * 3. Resolves permission issues on Windows
 */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const os = require("os");

// Configuration
const binaryVersion = "6.0.4";
const cacheDir = "./.cache/mongodb-memory-server/mongodb-binaries";

// Helper functions
function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      return resolve(stdout.trim());
    });
  });
}

async function checkMongoBinary() {
  console.log("Checking MongoDB Memory Server package...");
  try {
    const monogdbMemoryServer = require("mongodb-memory-server");
    console.log("✅ mongodb-memory-server is installed");
    return true;
  } catch (error) {
    console.error("❌ Error loading mongodb-memory-server:", error.message);
    return false;
  }
}

async function createCacheDirectories() {
  console.log("Creating cache directories if needed...");
  try {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    console.log("✅ Cache directories ready");
    return true;
  } catch (error) {
    console.error("❌ Error creating cache directories:", error.message);
    return false;
  }
}

async function cleanupExistingBinaries() {
  // On Windows, get the binary name
  let binaryName;
  if (os.platform() === "win32") {
    binaryName = `mongod-x64-win32-${binaryVersion}.exe`;
  } else if (os.platform() === "darwin") {
    binaryName = `mongod-${os.arch() === "arm64" ? "arm64" : "x64"}-macos-${binaryVersion}`;
  } else {
    binaryName = `mongod-${os.arch() === "arm64" ? "aarch64" : "x64"}-ubuntu-${binaryVersion}`;
  }

  const binaryPath = path.join(cacheDir, binaryName);

  console.log(`Checking MongoDB binary: ${binaryPath}`);

  if (fs.existsSync(binaryPath)) {
    console.log("MongoDB binary exists, verifying permissions...");

    // On Windows, file in use or permission issues are common
    if (os.platform() === "win32") {
      try {
        // Try to rename the file as a test - if it succeeds, we have write access
        const tempPath = `${binaryPath}.tmp`;
        fs.renameSync(binaryPath, tempPath);
        fs.renameSync(tempPath, binaryPath);
        console.log("✅ Binary permissions OK");
      } catch (error) {
        console.log("⚠️ Permission issue with the existing binary, attempting cleanup...");

        try {
          await execPromise(`DEL "${binaryPath}" /F /Q`);
          console.log("✅ Removed binary using DEL command");
        } catch (delError) {
          console.warn("⚠️ DEL command failed, file may be in use by another process");
          console.warn("Please close any MongoDB or test processes and try again");
        }
      }
    }
  } else {
    console.log("MongoDB binary does not exist yet");
  }
}

async function installMongoBinary() {
  console.log("Installing MongoDB binary...");
  try {
    // Require the MongoMemoryServer
    const { MongoMemoryServer } = require("mongodb-memory-server");

    // Create an instance which will download the binary if needed
    console.log(`Creating MongoDB Memory Server (will download ${binaryVersion} if needed)...`);
    const mongod = await MongoMemoryServer.create({
      binary: {
        version: binaryVersion,
        downloadDir: cacheDir,
      },
    });

    console.log("✅ MongoDB Memory Server created successfully");

    // Start and stop to verify the binary works
    console.log("Starting MongoDB to verify binary...");
    const uri = mongod.getUri();
    console.log(`✅ MongoDB started at: ${uri}`);

    console.log("Stopping MongoDB...");
    await mongod.stop();
    console.log("✅ MongoDB stopped successfully");

    return true;
  } catch (error) {
    console.error("❌ Error installing MongoDB binary:", error.message);
    if (error.message.includes("Incorrect State for operation")) {
      console.log(
        "\nThis appears to be a compatibility issue between mongodb-memory-server versions.",
      );
      console.log("Please make sure your testDbHelper.ts file is updated for the correct version.");
    }
    return false;
  }
}

async function clearNpmCache() {
  console.log("Clearing npm cache to ensure clean state...");
  try {
    await execPromise("npm cache verify");
    console.log("✅ npm cache verified");
    return true;
  } catch (error) {
    console.warn("⚠️ Error clearing npm cache:", error.message);
    return false;
  }
}

async function main() {
  console.log("🔧 MongoDB Binary Fix Script 🔧");
  console.log("-------------------------------");

  try {
    await checkMongoBinary();
    await createCacheDirectories();
    await cleanupExistingBinaries();
    await clearNpmCache();

    // Install and verify MongoDB binary
    const success = await installMongoBinary();

    if (success) {
      console.log("\n✅ MongoDB binary setup completed successfully!");
      process.exit(0);
    } else {
      console.error("\n❌ MongoDB binary setup failed!");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run the script
main();
