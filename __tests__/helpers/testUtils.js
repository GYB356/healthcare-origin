const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

const connectDB = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
};

const closeDB = async () => {
  await mongoose.connection.close();
  await mongod.stop();
};

const clearDB = async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(
    collections.map(collection => collection.deleteMany())
  );
};

const createTestUser = async (userData = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'DOCTOR',
    ...userData
  };
  
  return await mongoose.model('User').create(defaultUser);
};

const createTestPatient = async (patientData = {}) => {
  const defaultPatient = {
    name: 'Test Patient',
    email: 'patient@example.com',
    phone: '1234567890',
    ...patientData
  };
  
  return await mongoose.model('Patient').create(defaultPatient);
};

const createTestAppointment = async (appointmentData = {}) => {
  const defaultAppointment = {
    patientId: appointmentData.patientId || (await createTestPatient())._id,
    doctorId: appointmentData.doctorId || (await createTestUser())._id,
    date: new Date(),
    status: 'SCHEDULED',
    ...appointmentData
  };
  
  return await mongoose.model('Appointment').create(defaultAppointment);
};

const createTestChat = async (chatData) => {
  const chat = new mongoose.model('Chat')(chatData);
  await chat.save();
  return chat;
};

const mockWebSocket = () => {
  const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    connected: false,
    disconnect: jest.fn(),
    connect: jest.fn(),
  };
  return mockSocket;
};

const waitForCondition = async (condition, timeout = 5000) => {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Condition not met within timeout');
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};

module.exports = {
  connectDB,
  closeDB,
  clearDB,
  createTestUser,
  createTestPatient,
  createTestAppointment,
  createTestChat,
  mockWebSocket,
  waitForCondition,
}; 