const { faker } = require('@faker-js/faker');

const createUserData = (role = 'patient') => ({
  email: faker.internet.email(),
  password: 'test123',
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  role,
  phone: faker.phone.number(),
  address: faker.location.streetAddress(),
  dateOfBirth: faker.date.past({ years: 30 }).toISOString(),
});

const createAppointmentData = (doctorId, patientId) => ({
  doctorId,
  patientId,
  date: faker.date.future().toISOString(),
  time: faker.date.recent().toISOString(),
  status: 'scheduled',
  type: faker.helpers.arrayElement(['checkup', 'consultation', 'follow-up']),
  notes: faker.lorem.paragraph(),
});

const createChatData = (participants) => ({
  participants,
  messages: [],
  lastMessage: null,
  lastMessageTime: null,
  isActive: true,
});

const createMessageData = (senderId, chatId) => ({
  senderId,
  chatId,
  content: faker.lorem.sentence(),
  timestamp: new Date(),
  read: false,
});

const createNotificationData = (userId, type) => ({
  userId,
  type,
  title: faker.lorem.sentence(),
  message: faker.lorem.paragraph(),
  read: false,
  createdAt: new Date(),
});

const createPrescriptionData = (doctorId, patientId, appointmentId) => ({
  doctorId,
  patientId,
  appointmentId,
  medications: [
    {
      name: faker.helpers.arrayElement(['Amoxicillin', 'Ibuprofen', 'Aspirin']),
      dosage: faker.helpers.arrayElement(['500mg', '1000mg', '250mg']),
      frequency: faker.helpers.arrayElement(['Once daily', 'Twice daily', 'Three times daily']),
      duration: faker.helpers.arrayElement(['7 days', '14 days', '30 days']),
    },
  ],
  notes: faker.lorem.paragraph(),
  issuedAt: new Date(),
});

module.exports = {
  createUserData,
  createAppointmentData,
  createChatData,
  createMessageData,
  createNotificationData,
  createPrescriptionData,
}; 