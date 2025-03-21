import { createMocks } from 'node-mocks-http';
import { getServerSession } from 'next-auth/next';
import appointmentHandler from '@/pages/api/appointments';
import invoiceHandler from '@/pages/api/invoices';
import medicalRecordHandler from '@/pages/api/medical-records';
import prisma from '@/lib/prisma';

jest.mock('next-auth/next');
jest.mock('@/lib/prisma');

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Appointments API', () => {
    const mockAppointment = {
      id: '1',
      patientId: '1',
      doctorId: '2',
      date: new Date(),
      status: 'SCHEDULED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create an appointment', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          doctorId: '2',
          date: new Date(),
        },
      });

      const mockSession = {
        user: { id: '1', role: 'patient' },
      };

      (getServerSession as jest.Mock).mockResolvedValueOnce(mockSession);
      (prisma.appointment.create as jest.Mock).mockResolvedValueOnce(mockAppointment);

      await appointmentHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual(mockAppointment);
    });

    it('should get appointments for authenticated user', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      });

      const mockSession = {
        user: { id: '1', role: 'patient' },
      };

      (getServerSession as jest.Mock).mockResolvedValueOnce(mockSession);
      (prisma.appointment.findMany as jest.Mock).mockResolvedValueOnce([mockAppointment]);

      await appointmentHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ appointments: [mockAppointment] });
    });
  });

  describe('Invoices API', () => {
    const mockInvoice = {
      id: '1',
      patientId: '1',
      amount: 100,
      tax: 10,
      discount: 5,
      totalAmount: 105,
      status: 'PENDING',
      createdAt: new Date(),
    };

    it('should create an invoice', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          patientId: '1',
          amount: 100,
          tax: 10,
          discount: 5,
        },
      });

      const mockSession = {
        user: { id: '1', role: 'staff' },
      };

      (getServerSession as jest.Mock).mockResolvedValueOnce(mockSession);
      (prisma.invoice.create as jest.Mock).mockResolvedValueOnce(mockInvoice);

      await invoiceHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual(mockInvoice);
    });

    it('should update invoice status', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
        query: { id: '1' },
        body: { status: 'PAID' },
      });

      const mockSession = {
        user: { id: '1', role: 'staff' },
      };

      (getServerSession as jest.Mock).mockResolvedValueOnce(mockSession);
      (prisma.invoice.update as jest.Mock).mockResolvedValueOnce({ ...mockInvoice, status: 'PAID' });

      await invoiceHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData()).status).toBe('PAID');
    });
  });

  describe('Medical Records API', () => {
    const mockMedicalRecord = {
      id: '1',
      patientId: '1',
      doctorId: '2',
      title: 'Check-up',
      description: 'Regular check-up',
      createdAt: new Date(),
    };

    it('should create a medical record', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          patientId: '1',
          title: 'Check-up',
          description: 'Regular check-up',
        },
      });

      const mockSession = {
        user: { id: '2', role: 'doctor' },
      };

      (getServerSession as jest.Mock).mockResolvedValueOnce(mockSession);
      (prisma.medicalRecord.create as jest.Mock).mockResolvedValueOnce(mockMedicalRecord);

      await medicalRecordHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual(mockMedicalRecord);
    });

    it('should get medical records for patient', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { patientId: '1' },
      });

      const mockSession = {
        user: { id: '2', role: 'doctor' },
      };

      (getServerSession as jest.Mock).mockResolvedValueOnce(mockSession);
      (prisma.medicalRecord.findMany as jest.Mock).mockResolvedValueOnce([mockMedicalRecord]);

      await medicalRecordHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ records: [mockMedicalRecord] });
    });
  });
}); 