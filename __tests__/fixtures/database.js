/**
 * Database Fixtures
 *
 * This file contains test data fixtures for database tests.
 * Use these fixtures to ensure consistent test data across test files.
 */

/**
 * Create test data for users
 */
const users = [
  {
    name: "Test Admin",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
  },
  {
    name: "Test Doctor",
    email: "doctor@example.com",
    password: "password123",
    role: "doctor",
  },
  {
    name: "Test Patient",
    email: "patient@example.com",
    password: "password123",
    role: "patient",
  },
];

/**
 * Create test data for appointments
 */
const appointments = [
  {
    patientName: "Test Patient",
    date: "2024-04-15",
    time: "10:00",
    status: "scheduled",
    notes: "Regular checkup",
  },
  {
    patientName: "Test Patient",
    date: "2024-04-20",
    time: "14:30",
    status: "completed",
    notes: "Follow-up appointment",
  },
  {
    patientName: "Test Patient",
    date: "2024-04-25",
    time: "11:15",
    status: "cancelled",
    notes: "Cancelled by patient",
  },
];

/**
 * Create test data for medical reports
 */
const reports = [
  {
    appointmentId: "1",
    doctor: "Test Doctor",
    report: "Patient is in good health.",
    medicalInfo: {
      symptoms: ["Headache", "Fatigue"],
      diagnosis: "Mild dehydration",
      recommendations: ["Drink more water", "Get more rest"],
      medications: ["Acetaminophen as needed"],
      followUpNeeded: false,
    },
    followUpQuestions: "",
    createdAt: new Date("2024-04-20").toISOString(),
  },
];

/**
 * Create complete test dataset for all models
 */
const createTestData = () => {
  return {
    User: users,
    Appointment: appointments,
    Report: reports,
  };
};

/**
 * Create relationship test data
 * This creates data with proper relationships between models
 */
const createRelationshipData = async (models) => {
  // Create users first
  const createdUsers = await Promise.all(users.map((user) => models.User.create(user)));

  // Map user roles to created users
  const userMap = {
    admin: createdUsers.find((u) => u.role === "admin"),
    doctor: createdUsers.find((u) => u.role === "doctor"),
    patient: createdUsers.find((u) => u.role === "patient"),
  };

  // Create appointments with proper user references
  const appointmentsWithRefs = appointments.map((apt) => ({
    ...apt,
    patientId: userMap.patient._id,
    doctorId: userMap.doctor._id,
  }));

  const createdAppointments = await Promise.all(
    appointmentsWithRefs.map((apt) => models.Appointment.create(apt)),
  );

  // Create reports with proper appointment references
  const reportsWithRefs = reports.map((report, index) => ({
    ...report,
    appointmentId: createdAppointments[index]._id,
    doctorId: userMap.doctor._id,
  }));

  const createdReports = await Promise.all(
    reportsWithRefs.map((report) => models.Report.create(report)),
  );

  return {
    users: createdUsers,
    appointments: createdAppointments,
    reports: createdReports,
    userMap,
  };
};

module.exports = {
  users,
  appointments,
  reports,
  createTestData,
  createRelationshipData,
};
