import { createMocks } from 'node-mocks-http'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { handleDoctors } from '@/app/api/doctors/route'

jest.mock('next-auth')
jest.mock('@/lib/prisma')

describe('Doctors API', () => {
  const mockSession = {
    user: {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'ADMIN'
    }
  }

  const mockDoctors = [
    {
      id: '1',
      name: 'Dr. Smith',
      email: 'dr.smith@example.com',
      role: 'DOCTOR',
      specialization: 'Cardiology'
    },
    {
      id: '2',
      name: 'Dr. Johnson',
      email: 'dr.johnson@example.com',
      role: 'DOCTOR',
      specialization: 'Pediatrics'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.user.findMany as jest.Mock).mockResolvedValue(mockDoctors)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('returns list of doctors for GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    })

    await handleDoctors(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      doctors: mockDoctors
    })
  })

  it('creates new doctor for POST request', async () => {
    const newDoctor = {
      name: 'Dr. Brown',
      email: 'dr.brown@example.com',
      password: 'password123',
      specialization: 'Neurology'
    }

    ;(prisma.user.create as jest.Mock).mockResolvedValueOnce({
      id: '3',
      ...newDoctor,
      role: 'DOCTOR'
    })

    const { req, res } = createMocks({
      method: 'POST',
      body: newDoctor
    })

    await handleDoctors(req, res)

    expect(res._getStatusCode()).toBe(201)
    expect(JSON.parse(res._getData())).toEqual({
      doctor: {
        id: '3',
        name: newDoctor.name,
        email: newDoctor.email,
        role: 'DOCTOR',
        specialization: newDoctor.specialization
      }
    })
  })

  it('returns 401 if not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)
    const { req, res } = createMocks({
      method: 'GET'
    })

    await handleDoctors(req, res)

    expect(res._getStatusCode()).toBe(401)
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Not authenticated'
    })
  })

  it('returns 403 if not admin', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce({
      user: { ...mockSession.user, role: 'PATIENT' }
    })
    const { req, res } = createMocks({
      method: 'GET'
    })

    await handleDoctors(req, res)

    expect(res._getStatusCode()).toBe(403)
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Not authorized'
    })
  })
}) 