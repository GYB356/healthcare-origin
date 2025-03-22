const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../app');
const Appointment = require('../models/Appointment');
const Invoice = require('../models/Invoice');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');

let mongod;
let prisma;

beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // Initialize Prisma client
  prisma = new PrismaClient();
  await prisma.$connect();

  // Import app after database connection
  app = require('../app');
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

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'DOCTOR'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.password).toBeUndefined();
    });

    it('should not register user with duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'DOCTOR'
      };

      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toBe('Email already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body.error).toContain('name');
      expect(response.body.error).toContain('email');
      expect(response.body.error).toContain('password');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const hashedPassword = await hash('password123', 10);
      await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: hashedPassword,
          role: 'DOCTOR'
        }
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });
  });
});

describe('Appointments API', () => {
  let doctorToken;
  let patientToken;
  let doctorId;
  let patientId;

  beforeEach(async () => {
    // Create test doctor
    const doctorPassword = await hash('password123', 10);
    const doctor = await prisma.user.create({
      data: {
        name: 'Doctor Test',
        email: 'doctor@example.com',
        password: doctorPassword,
        role: 'DOCTOR'
      }
    });
    doctorId = doctor.id;
    doctorToken = jwt.sign({ userId: doctor.id }, process.env.JWT_SECRET);

    // Create test patient
    const patientPassword = await hash('password123', 10);
    const patient = await prisma.user.create({
      data: {
        name: 'Patient Test',
        email: 'patient@example.com',
        password: patientPassword,
        role: 'PATIENT'
      }
    });
    patientId = patient.id;
    patientToken = jwt.sign({ userId: patient.id }, process.env.JWT_SECRET);
  });

  describe('POST /api/appointments', () => {
    it('should create a new appointment', async () => {
      const appointmentData = {
        doctorId,
        patientId,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'SCHEDULED'
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(appointmentData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.doctorId).toBe(doctorId);
      expect(response.body.patientId).toBe(patientId);
    });

    it('should not create appointment with invalid date', async () => {
      const appointmentData = {
        doctorId,
        patientId,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'SCHEDULED'
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(appointmentData)
        .expect(400);

      expect(response.body.error).toBe('Appointment date must be in the future');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({})
        .expect(400);

      expect(response.body.error).toContain('doctorId');
      expect(response.body.error).toContain('patientId');
      expect(response.body.error).toContain('date');
    });
  });

  describe('GET /api/appointments', () => {
    beforeEach(async () => {
      // Create test appointments
      await prisma.appointment.create({
        data: {
          doctorId,
          patientId,
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'SCHEDULED'
        }
      });
    });

    it('should get appointments for doctor', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${doctorToken}`)
        .query({ role: 'DOCTOR' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].doctorId).toBe(doctorId);
    });

    it('should get appointments for patient', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .query({ role: 'PATIENT' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].patientId).toBe(patientId);
    });

    it('should handle pagination', async () => {
      // Create multiple appointments
      for (let i = 0; i < 15; i++) {
        await prisma.appointment.create({
          data: {
            doctorId,
            patientId,
            date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
            status: 'SCHEDULED'
          }
        });
      }

      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${doctorToken}`)
        .query({ role: 'DOCTOR', page: 1, limit: 10 })
        .expect(200);

      expect(response.body.length).toBe(10);
    });
  });

  describe('PUT /api/appointments/:id', () => {
    let appointmentId;

    beforeEach(async () => {
      const appointment = await prisma.appointment.create({
        data: {
          doctorId,
          patientId,
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: 'SCHEDULED'
        }
      });
      appointmentId = appointment.id;
    });

    it('should update appointment status', async () => {
      const response = await request(app)
        .put(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ status: 'COMPLETED' })
        .expect(200);

      expect(response.body.status).toBe('COMPLETED');
    });

    it('should not update appointment with invalid status', async () => {
      const response = await request(app)
        .put(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);

      expect(response.body.error).toBe('Invalid appointment status');
    });

    it('should not update non-existent appointment', async () => {
      const response = await request(app)
        .put('/api/appointments/nonexistent-id')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ status: 'COMPLETED' })
        .expect(404);

      expect(response.body.error).toBe('Appointment not found');
    });
  });
});

describe('Invoices API', () => {
  let testInvoice;

  beforeEach(async () => {
    testInvoice = await Invoice.create({
      patientId: patientId,
      doctorId: doctorId,
      amount: 150,
      services: ['consultation', 'prescription'],
      status: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  });

  afterEach(async () => {
    await Invoice.deleteMany({});
  });

  it('should create a new invoice with valid data', async () => {
    const response = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        patientId: patientId,
        amount: 200,
        services: ['consultation', 'prescription', 'lab-work'],
        status: 'pending',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.amount).toBe(200);
    expect(response.body.services).toHaveLength(3);
  });

  it('should validate invoice amount', async () => {
    const response = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        patientId: patientId,
        amount: -100,
        services: ['consultation'],
        status: 'pending'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('amount');
  });

  it('should get invoices for a patient with filtering', async () => {
    const response = await request(app)
      .get('/api/invoices/patient/' + patientId)
      .set('Authorization', `Bearer ${patientToken}`)
      .query({ status: 'pending' });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBeTruthy();
    expect(response.body.data.every(invoice => invoice.status === 'pending')).toBeTruthy();
  });

  it('should update invoice status', async () => {
    const response = await request(app)
      .patch(`/api/invoices/${testInvoice._id}/status`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ status: 'paid' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('paid');
  });
});

describe('Medical Records API', () => {
  let testRecord;

  beforeEach(async () => {
    testRecord = await MedicalRecord.create({
      patientId: patientId,
      doctorId: doctorId,
      diagnosis: 'Common cold',
      prescription: 'Antibiotics',
      notes: 'Follow up in 1 week',
      date: new Date()
    });
  });

  afterEach(async () => {
    await MedicalRecord.deleteMany({});
  });

  it('should create a new medical record with valid data', async () => {
    const response = await request(app)
      .post('/api/medical-records')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        patientId: patientId,
        diagnosis: 'Bronchitis',
        prescription: 'Inhaler',
        notes: 'Follow up in 2 weeks',
        date: new Date()
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.diagnosis).toBe('Bronchitis');
    expect(response.body.prescription).toBe('Inhaler');
  });

  it('should validate required fields for medical records', async () => {
    const response = await request(app)
      .post('/api/medical-records')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('patientId');
    expect(response.body.error).toContain('diagnosis');
    expect(response.body.error).toContain('prescription');
  });

  it('should get medical records for a patient with date filtering', async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();

    const response = await request(app)
      .get('/api/medical-records/patient/' + patientId)
      .set('Authorization', `Bearer ${patientToken}`)
      .query({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBeTruthy();
    expect(response.body.data.every(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    })).toBeTruthy();
  });

  it('should update medical record', async () => {
    const response = await request(app)
      .patch(`/api/medical-records/${testRecord._id}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        notes: 'Updated follow-up instructions'
      });

    expect(response.status).toBe(200);
    expect(response.body.notes).toBe('Updated follow-up instructions');
  });
}); 