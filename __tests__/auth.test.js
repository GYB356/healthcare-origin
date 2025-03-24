const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");
const jwt = require("jsonwebtoken");

let app;
let mongod;
let prisma;

beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Initialize Prisma client
  prisma = new PrismaClient();
  await prisma.$connect();

  // Import app after database connection
  app = require("../app");
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany();
  }
});

describe("User Registration", () => {
  it("should register a new user successfully", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "DOCTOR",
    };

    const response = await request(app).post("/api/auth/register").send(userData).expect(201);

    expect(response.body).toHaveProperty("token");
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user.email).toBe(userData.email);
    expect(response.body.user.password).toBeUndefined();
  });

  it("should not register user with duplicate email", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "DOCTOR",
    };

    // Create first user
    await request(app).post("/api/auth/register").send(userData);

    // Try to create second user with same email
    const response = await request(app).post("/api/auth/register").send(userData).expect(400);

    expect(response.body.error).toBe("Email already exists");
  });

  it("should validate required fields", async () => {
    const response = await request(app).post("/api/auth/register").send({}).expect(400);

    expect(response.body.error).toContain("name");
    expect(response.body.error).toContain("email");
    expect(response.body.error).toContain("password");
  });

  it("should validate email format", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "invalid-email",
        password: "password123",
        role: "DOCTOR",
      })
      .expect(400);

    expect(response.body.error).toContain("email");
  });

  it("should validate password strength", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "weak",
        role: "DOCTOR",
      })
      .expect(400);

    expect(response.body.error).toContain("password");
  });

  it("should validate role", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "INVALID_ROLE",
      })
      .expect(400);

    expect(response.body.error).toContain("role");
  });
});

describe("User Login", () => {
  beforeEach(async () => {
    // Create a test user
    const hashedPassword = await hash("password123", 10);
    await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
        role: "DOCTOR",
      },
    });
  });

  it("should login successfully with valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "password123",
      })
      .expect(200);

    expect(response.body).toHaveProperty("token");
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user.email).toBe("test@example.com");
  });

  it("should not login with invalid password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "wrongpassword",
      })
      .expect(401);

    expect(response.body.error).toBe("Invalid credentials");
  });

  it("should not login with non-existent email", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "nonexistent@example.com",
        password: "password123",
      })
      .expect(401);

    expect(response.body.error).toBe("Invalid credentials");
  });

  it("should validate required fields", async () => {
    const response = await request(app).post("/api/auth/login").send({}).expect(400);

    expect(response.body.error).toContain("email");
    expect(response.body.error).toContain("password");
  });
});

describe("Token Validation", () => {
  let validToken;

  beforeEach(async () => {
    // Create a test user and generate token
    const hashedPassword = await hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
        role: "DOCTOR",
      },
    });

    validToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  });

  it("should validate valid token", async () => {
    const response = await request(app)
      .get("/api/auth/validate")
      .set("Authorization", `Bearer ${validToken}`)
      .expect(200);

    expect(response.body).toHaveProperty("valid", true);
    expect(response.body.user).toHaveProperty("id");
  });

  it("should reject invalid token", async () => {
    const response = await request(app)
      .get("/api/auth/validate")
      .set("Authorization", "Bearer invalid-token")
      .expect(401);

    expect(response.body.error).toBe("Invalid token");
  });

  it("should reject expired token", async () => {
    const expiredToken = jwt.sign({ userId: "test-id" }, process.env.JWT_SECRET, {
      expiresIn: "0s",
    });

    const response = await request(app)
      .get("/api/auth/validate")
      .set("Authorization", `Bearer ${expiredToken}`)
      .expect(401);

    expect(response.body.error).toBe("Token expired");
  });

  it("should reject malformed token", async () => {
    const response = await request(app)
      .get("/api/auth/validate")
      .set("Authorization", "Bearer malformed.token")
      .expect(401);

    expect(response.body.error).toBe("Invalid token");
  });

  it("should reject missing token", async () => {
    const response = await request(app).get("/api/auth/validate").expect(401);

    expect(response.body.error).toBe("No token provided");
  });
});

describe("Password Reset", () => {
  beforeEach(async () => {
    // Create a test user
    const hashedPassword = await hash("password123", 10);
    await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
        role: "DOCTOR",
      },
    });
  });

  it("should initiate password reset for valid email", async () => {
    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "test@example.com" })
      .expect(200);

    expect(response.body.message).toBe("Password reset email sent");
  });

  it("should handle non-existent email gracefully", async () => {
    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "nonexistent@example.com" })
      .expect(200);

    expect(response.body.message).toBe("Password reset email sent");
  });

  it("should validate email format", async () => {
    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "invalid-email" })
      .expect(400);

    expect(response.body.error).toContain("email");
  });

  it("should validate required fields", async () => {
    const response = await request(app).post("/api/auth/forgot-password").send({}).expect(400);

    expect(response.body.error).toContain("email");
  });
});

describe("Role-Based Access Control", () => {
  let doctorToken;
  let patientToken;
  let adminToken;

  beforeEach(async () => {
    // Create test users with different roles
    const hashedPassword = await hash("password123", 10);

    const doctor = await prisma.user.create({
      data: {
        name: "Doctor Test",
        email: "doctor@example.com",
        password: hashedPassword,
        role: "DOCTOR",
      },
    });
    doctorToken = jwt.sign({ userId: doctor.id }, process.env.JWT_SECRET);

    const patient = await prisma.user.create({
      data: {
        name: "Patient Test",
        email: "patient@example.com",
        password: hashedPassword,
        role: "PATIENT",
      },
    });
    patientToken = jwt.sign({ userId: patient.id }, process.env.JWT_SECRET);

    const admin = await prisma.user.create({
      data: {
        name: "Admin Test",
        email: "admin@example.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    adminToken = jwt.sign({ userId: admin.id }, process.env.JWT_SECRET);
  });

  it("should allow doctor to access doctor routes", async () => {
    const response = await request(app)
      .get("/api/doctor/dashboard")
      .set("Authorization", `Bearer ${doctorToken}`)
      .expect(200);

    expect(response.body).toBeDefined();
  });

  it("should not allow patient to access doctor routes", async () => {
    const response = await request(app)
      .get("/api/doctor/dashboard")
      .set("Authorization", `Bearer ${patientToken}`)
      .expect(403);

    expect(response.body.error).toBe("Access denied");
  });

  it("should allow admin to access all routes", async () => {
    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toBeDefined();
  });

  it("should not allow doctor to access admin routes", async () => {
    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${doctorToken}`)
      .expect(403);

    expect(response.body.error).toBe("Access denied");
  });
});
