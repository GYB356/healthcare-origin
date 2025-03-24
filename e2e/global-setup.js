const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

async function globalSetup() {
  // Connect to the database
  await prisma.$connect();

  // Create test users
  const hashedPassword = await hash("password123", 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      name: "Test Admin",
      email: "admin@test.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // Create doctor user
  const doctor = await prisma.user.create({
    data: {
      name: "Test Doctor",
      email: "doctor@test.com",
      password: hashedPassword,
      role: "DOCTOR",
    },
  });

  // Create patient user
  const patient = await prisma.user.create({
    data: {
      name: "Test Patient",
      email: "patient@test.com",
      password: hashedPassword,
      role: "PATIENT",
    },
  });

  // Generate test tokens
  const adminToken = jwt.sign({ userId: admin.id }, process.env.JWT_SECRET);
  const doctorToken = jwt.sign({ userId: doctor.id }, process.env.JWT_SECRET);
  const patientToken = jwt.sign({ userId: patient.id }, process.env.JWT_SECRET);

  // Store test data in process.env for use in tests
  process.env.TEST_ADMIN_TOKEN = adminToken;
  process.env.TEST_DOCTOR_TOKEN = doctorToken;
  process.env.TEST_PATIENT_TOKEN = patientToken;
  process.env.TEST_ADMIN_ID = admin.id;
  process.env.TEST_DOCTOR_ID = doctor.id;
  process.env.TEST_PATIENT_ID = patient.id;
}

module.exports = globalSetup;
