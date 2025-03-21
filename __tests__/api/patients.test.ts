import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { createMocks } from 'node-mocks-http'
import { GET, POST, PUT, DELETE } from '@/app/api/patients/[id]/route'
import { GET as listGET } from '@/app/api/patients/route'

jest.mock('next-auth')
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    patient: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}))

describe('Patients API', () => {
  const mockSession = {
    user: {
      id: '1',
      name: 'Test Doctor',
      email: 'doctor@example.com',
      role: 'DOCTOR'
    }
  }

  beforeEach(() => {
    jest.resetAllMocks()
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
  })

  describe('GET /api/patients/[id]', () => {
    it('should return a patient', async () => {
      const mockPatient = {
        id: '1',
        name: 'Test Patient',
        email: 'patient@example.com'
      }

      const prisma = require('@/lib/prisma').default
      prisma.patient.findUnique.mockResolvedValue(mockPatient)

      const { req, res } = createMocks({
        method: 'GET'
      })

      await GET(req as unknown as NextRequest, { params: { id: '1' } })

      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqual(mockPatient)
    })

    it('should return 404 if patient not found', async () => {
      const prisma = require('@/lib/prisma').default
      prisma.patient.findUnique.mockResolvedValue(null)

      const { req, res } = createMocks({
        method: 'GET'
      })

      await GET(req as unknown as NextRequest, { params: { id: '1' } })

      expect(res._getStatusCode()).toBe(404)
    })
  })

  describe('POST /api/patients', () => {
    it('should create a new patient', async () => {
      const mockPatient = {
        name: 'New Patient',
        email: 'new@example.com'
      }

      const prisma = require('@/lib/prisma').default
      prisma.patient.create.mockResolvedValue({ id: '1', ...mockPatient })

      const { req, res } = createMocks({
        method: 'POST',
        body: mockPatient
      })

      await POST(req as unknown as NextRequest)

      expect(res._getStatusCode()).toBe(201)
      expect(JSON.parse(res._getData())).toEqual({ id: '1', ...mockPatient })
    })
  })

  describe('PUT /api/patients/[id]', () => {
    it('should update a patient', async () => {
      const mockPatient = {
        id: '1',
        name: 'Updated Patient',
        email: 'updated@example.com'
      }

      const prisma = require('@/lib/prisma').default
      prisma.patient.update.mockResolvedValue(mockPatient)

      const { req, res } = createMocks({
        method: 'PUT',
        body: mockPatient
      })

      await PUT(req as unknown as NextRequest, { params: { id: '1' } })

      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqual(mockPatient)
    })
  })

  describe('DELETE /api/patients/[id]', () => {
    it('should delete a patient', async () => {
      const mockPatient = {
        id: '1',
        name: 'Test Patient',
        email: 'test@example.com'
      }

      const prisma = require('@/lib/prisma').default
      prisma.patient.delete.mockResolvedValue(mockPatient)

      const { req, res } = createMocks({
        method: 'DELETE'
      })

      await DELETE(req as unknown as NextRequest, { params: { id: '1' } })

      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqual(mockPatient)
    })
  })

  describe('GET /api/patients', () => {
    it('should return a list of patients', async () => {
      const mockPatients = [
        { id: '1', name: 'Patient 1', email: 'patient1@example.com' },
        { id: '2', name: 'Patient 2', email: 'patient2@example.com' }
      ]

      const prisma = require('@/lib/prisma').default
      prisma.patient.findMany.mockResolvedValue(mockPatients)

      const { req, res } = createMocks({
        method: 'GET'
      })

      await listGET(req as unknown as NextRequest)

      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqual(mockPatients)
    })
  })
}) 