import React from 'react'
import { render, screen } from '@testing-library/react'
import ConsultationReport from '@/components/ConsultationReport'

// Mock data
const mockConsultation = {
  id: '1',
  date: new Date('2024-03-20'),
  diagnosis: 'Common Cold',
  symptoms: 'Fever, Cough',
  prescription: 'Rest and fluids',
  notes: 'Follow up in 1 week',
  doctorId: 'doc1',
  patientId: 'pat1',
  doctor: {
    id: 'doc1',
    name: 'Dr. Smith',
    email: 'dr.smith@example.com',
    role: 'DOCTOR'
  },
  patient: {
    id: 'pat1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    address: '123 Main St'
  }
}

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn()
  })
}))

describe('ConsultationReport', () => {
  it('renders consultation details correctly', () => {
    render(<ConsultationReport consultation={mockConsultation} />)
    
    // Check if main elements are rendered
    expect(screen.getByText('Consultation Report')).toBeInTheDocument()
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    
    // Check if consultation details are displayed
    expect(screen.getByText(/Common Cold/)).toBeInTheDocument()
    expect(screen.getByText(/Fever, Cough/)).toBeInTheDocument()
    expect(screen.getByText(/Rest and fluids/)).toBeInTheDocument()
    expect(screen.getByText(/Follow up in 1 week/)).toBeInTheDocument()
  })

  it('displays formatted date correctly', () => {
    render(<ConsultationReport consultation={mockConsultation} />)
    expect(screen.getByText(/March 20, 2024/)).toBeInTheDocument()
  })

  it('renders patient information section', () => {
    render(<ConsultationReport consultation={mockConsultation} />)
    expect(screen.getByText('Patient Information')).toBeInTheDocument()
    expect(screen.getByText('1234567890')).toBeInTheDocument()
    expect(screen.getByText('123 Main St')).toBeInTheDocument()
  })

  it('renders doctor information section', () => {
    render(<ConsultationReport consultation={mockConsultation} />)
    expect(screen.getByText('Doctor Information')).toBeInTheDocument()
    expect(screen.getByText('dr.smith@example.com')).toBeInTheDocument()
  })
}) 