const { createUserData, createAppointmentData, createChatData } = require("../helpers/factories");

const testUsers = {
  doctor: createUserData("doctor"),
  patient: createUserData("patient"),
  admin: createUserData("admin"),
};

const testAppointments = {
  scheduled: (doctorId, patientId) => createAppointmentData(doctorId, patientId),
  completed: (doctorId, patientId) => ({
    ...createAppointmentData(doctorId, patientId),
    status: "completed",
    notes: "Appointment completed successfully",
  }),
  cancelled: (doctorId, patientId) => ({
    ...createAppointmentData(doctorId, patientId),
    status: "cancelled",
    notes: "Appointment cancelled by patient",
  }),
};

const testChats = {
  active: (participants) => createChatData(participants),
  archived: (participants) => ({
    ...createChatData(participants),
    isActive: false,
  }),
};

const testMessages = {
  text: (senderId, chatId) => ({
    senderId,
    chatId,
    type: "text",
    content: "Hello, how are you?",
    timestamp: new Date(),
    read: false,
  }),
  image: (senderId, chatId) => ({
    senderId,
    chatId,
    type: "image",
    content: "https://example.com/image.jpg",
    timestamp: new Date(),
    read: false,
  }),
  file: (senderId, chatId) => ({
    senderId,
    chatId,
    type: "file",
    content: "https://example.com/document.pdf",
    fileName: "document.pdf",
    fileSize: 1024,
    timestamp: new Date(),
    read: false,
  }),
};

const testNotifications = {
  appointment: (userId) => ({
    userId,
    type: "appointment",
    title: "New Appointment Scheduled",
    message: "You have a new appointment scheduled for tomorrow.",
    read: false,
    createdAt: new Date(),
  }),
  message: (userId) => ({
    userId,
    type: "message",
    title: "New Message",
    message: "You have received a new message from your doctor.",
    read: false,
    createdAt: new Date(),
  }),
  prescription: (userId) => ({
    userId,
    type: "prescription",
    title: "New Prescription",
    message: "Your doctor has prescribed new medications.",
    read: false,
    createdAt: new Date(),
  }),
};

module.exports = {
  testUsers,
  testAppointments,
  testChats,
  testMessages,
  testNotifications,
};
