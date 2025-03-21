import { createMocks } from 'node-mocks-http'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { handleAuth } from '@/app/api/auth/[...nextauth]/route'

jest.mock('next-auth')
jest.mock('@/lib/prisma')

describe('Auth API', () => {
  const mockSession = {
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'DOCTOR'
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('returns 401 if not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)
    const { req, res } = createMocks({
      method: 'GET'
    })

    await handleAuth(req, res)

    expect(res._getStatusCode()).toBe(401)
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Not authenticated'
    })
  })

  it('returns user data if authenticated', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    })

    await handleAuth(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      user: mockSession.user
    })
  })

  it('handles POST request for user registration', async () => {
    const newUser = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
      role: 'PATIENT'
    }

    ;(prisma.user.create as jest.Mock).mockResolvedValueOnce({
      id: '2',
      ...newUser,
      password: 'hashed_password'
    })

    const { req, res } = createMocks({
      method: 'POST',
      body: newUser
    })

    await handleAuth(req, res)

    expect(res._getStatusCode()).toBe(201)
    expect(JSON.parse(res._getData())).toEqual({
      user: {
        id: '2',
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    })
  })

  it('handles validation errors in registration', async () => {
    const invalidUser = {
      name: 'New User',
      email: 'invalid-email',
      password: '123',
      role: 'INVALID'
    }

    const { req, res } = createMocks({
      method: 'POST',
      body: invalidUser
    })

    await handleAuth(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toHaveProperty('error')
  })
}) 