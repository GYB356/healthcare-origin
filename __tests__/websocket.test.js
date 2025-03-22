const WebSocket = require('ws');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { hash } = require('bcryptjs');

let wss;
let mongod;
let prisma;
let doctorToken;
let patientToken;
let doctorId;
let patientId;

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

  // Create test users
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

  // Import and start WebSocket server
  const { createServer } = require('http');
  const { Server } = require('ws');
  const server = createServer();
  wss = new Server({ server });
  require('../websocket')(wss);
  server.listen(3001);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
  await prisma.$disconnect();
  wss.close();
});

describe('WebSocket Connection', () => {
  let doctorWs;
  let patientWs;

  beforeEach((done) => {
    // Connect doctor client
    doctorWs = new WebSocket('ws://localhost:3001', {
      headers: {
        Authorization: `Bearer ${doctorToken}`
      }
    });

    // Connect patient client
    patientWs = new WebSocket('ws://localhost:3001', {
      headers: {
        Authorization: `Bearer ${patientToken}`
      }
    });

    // Wait for both connections to be established
    let connections = 0;
    const onConnection = () => {
      connections++;
      if (connections === 2) {
        done();
      }
    };

    doctorWs.on('open', onConnection);
    patientWs.on('open', onConnection);
  });

  afterEach(() => {
    doctorWs.close();
    patientWs.close();
  });

  it('should establish connection with valid token', (done) => {
    const ws = new WebSocket('ws://localhost:3001', {
      headers: {
        Authorization: `Bearer ${doctorToken}`
      }
    });

    ws.on('open', () => {
      expect(ws.readyState).toBe(WebSocket.OPEN);
      ws.close();
      done();
    });
  });

  it('should reject connection with invalid token', (done) => {
    const ws = new WebSocket('ws://localhost:3001', {
      headers: {
        Authorization: 'Bearer invalid-token'
      }
    });

    ws.on('error', (error) => {
      expect(error.message).toContain('Unauthorized');
      done();
    });
  });

  it('should reject connection without token', (done) => {
    const ws = new WebSocket('ws://localhost:3001');

    ws.on('error', (error) => {
      expect(error.message).toContain('Unauthorized');
      done();
    });
  });
});

describe('WebSocket Events', () => {
  let doctorWs;
  let patientWs;

  beforeEach((done) => {
    doctorWs = new WebSocket('ws://localhost:3001', {
      headers: {
        Authorization: `Bearer ${doctorToken}`
      }
    });

    patientWs = new WebSocket('ws://localhost:3001', {
      headers: {
        Authorization: `Bearer ${patientToken}`
      }
    });

    let connections = 0;
    const onConnection = () => {
      connections++;
      if (connections === 2) {
        done();
      }
    };

    doctorWs.on('open', onConnection);
    patientWs.on('open', onConnection);
  });

  afterEach(() => {
    doctorWs.close();
    patientWs.close();
  });

  it('should handle appointment updates', (done) => {
    const appointmentData = {
      type: 'APPOINTMENT_UPDATE',
      data: {
        id: 'test-appointment-id',
        status: 'COMPLETED'
      }
    };

    patientWs.on('message', (data) => {
      const message = JSON.parse(data);
      expect(message).toEqual(appointmentData);
      done();
    });

    doctorWs.send(JSON.stringify(appointmentData));
  });

  it('should handle chat messages', (done) => {
    const chatMessage = {
      type: 'CHAT_MESSAGE',
      data: {
        senderId: doctorId,
        receiverId: patientId,
        content: 'Hello, how are you?'
      }
    };

    patientWs.on('message', (data) => {
      const message = JSON.parse(data);
      expect(message).toEqual(chatMessage);
      done();
    });

    doctorWs.send(JSON.stringify(chatMessage));
  });

  it('should handle real-time notifications', (done) => {
    const notification = {
      type: 'NOTIFICATION',
      data: {
        userId: patientId,
        message: 'Your appointment has been scheduled'
      }
    };

    patientWs.on('message', (data) => {
      const message = JSON.parse(data);
      expect(message).toEqual(notification);
      done();
    });

    doctorWs.send(JSON.stringify(notification));
  });

  it('should handle invalid message format', (done) => {
    const invalidMessage = 'invalid-json';

    doctorWs.on('error', (error) => {
      expect(error.message).toContain('Invalid message format');
      done();
    });

    doctorWs.send(invalidMessage);
  });

  it('should handle unknown message type', (done) => {
    const unknownMessage = {
      type: 'UNKNOWN_TYPE',
      data: {}
    };

    doctorWs.on('error', (error) => {
      expect(error.message).toContain('Unknown message type');
      done();
    });

    doctorWs.send(JSON.stringify(unknownMessage));
  });
});

describe('WebSocket Reconnection', () => {
  let ws;

  beforeEach((done) => {
    ws = new WebSocket('ws://localhost:3001', {
      headers: {
        Authorization: `Bearer ${doctorToken}`
      }
    });

    ws.on('open', done);
  });

  afterEach(() => {
    ws.close();
  });

  it('should handle connection loss and reconnection', (done) => {
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;

    ws.on('close', () => {
      // Simulate connection loss
      ws.terminate();
    });

    ws.on('error', () => {
      reconnectAttempts++;
      if (reconnectAttempts >= maxReconnectAttempts) {
        done();
      }
    });

    // Force close the connection
    ws.close();
  });

  it('should maintain authentication after reconnection', (done) => {
    ws.on('close', () => {
      // Create new connection with same token
      const newWs = new WebSocket('ws://localhost:3001', {
        headers: {
          Authorization: `Bearer ${doctorToken}`
        }
      });

      newWs.on('open', () => {
        expect(newWs.readyState).toBe(WebSocket.OPEN);
        newWs.close();
        done();
      });
    });

    ws.close();
  });
});

describe('WebSocket Error Handling', () => {
  let ws;

  beforeEach((done) => {
    ws = new WebSocket('ws://localhost:3001', {
      headers: {
        Authorization: `Bearer ${doctorToken}`
      }
    });

    ws.on('open', done);
  });

  afterEach(() => {
    ws.close();
  });

  it('should handle malformed messages', (done) => {
    ws.on('error', (error) => {
      expect(error.message).toContain('Invalid message format');
      done();
    });

    ws.send('{invalid:json}');
  });

  it('should handle oversized messages', (done) => {
    const largeMessage = {
      type: 'CHAT_MESSAGE',
      data: {
        content: 'a'.repeat(1000000) // 1MB message
      }
    };

    ws.on('error', (error) => {
      expect(error.message).toContain('Message too large');
      done();
    });

    ws.send(JSON.stringify(largeMessage));
  });

  it('should handle rate limiting', (done) => {
    let messageCount = 0;
    const maxMessages = 100;

    const sendMessage = () => {
      if (messageCount >= maxMessages) {
        ws.on('error', (error) => {
          expect(error.message).toContain('Rate limit exceeded');
          done();
        });
        return;
      }

      ws.send(JSON.stringify({
        type: 'CHAT_MESSAGE',
        data: { content: `Message ${messageCount++}` }
      }));
    };

    // Send messages rapidly
    for (let i = 0; i < maxMessages + 1; i++) {
      setTimeout(sendMessage, i * 10);
    }
  });
});

describe('WebSocket Mock', () => {
  let ws;

  beforeEach(() => {
    ws = new WebSocket('ws://test.com');
  });

  afterEach(() => {
    ws.disconnect();
  });

  test('should handle connection states', (done) => {
    expect(ws.readyState).toBe(WebSocket.CONNECTING);
    
    ws.on('open', () => {
      expect(ws.readyState).toBe(WebSocket.OPEN);
      ws.close();
    });

    ws.on('close', () => {
      expect(ws.readyState).toBe(WebSocket.CLOSED);
      done();
    });

    ws.connect();
  });

  test('should handle message sending and receiving', (done) => {
    const testMessage = 'Hello, WebSocket!';
    
    ws.on('send', (data) => {
      expect(data).toBe(testMessage);
      ws.simulateMessage(testMessage);
    });

    ws.on('message', (data) => {
      expect(data).toBe(testMessage);
      done();
    });

    ws.connect();
    ws.send(testMessage);
  });

  test('should handle close with code and reason', (done) => {
    const closeCode = 1000;
    const closeReason = 'Test closure';
    
    ws.on('close', (code, reason) => {
      expect(code).toBe(closeCode);
      expect(reason).toBe(closeReason);
      done();
    });

    ws.connect();
    ws.close(closeCode, closeReason);
  });
}); 