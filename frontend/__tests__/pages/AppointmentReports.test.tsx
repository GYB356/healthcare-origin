import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import '../../suppress-act-warnings';
import AppointmentReports from '../../pages/AppointmentReports';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('AppointmentReports', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
  });

  it('renders loading state initially', () => {
    render(<AppointmentReports />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders appointment reports after loading', async () => {
    const mockAppointments = [
      {
        id: 1,
        patientName: 'John Doe',
        date: '2024-03-20',
        time: '10:00',
        status: 'completed'
      }
    ];

    mockAxiosInstance.get.mockResolvedValueOnce({ data: mockAppointments });

    render(<AppointmentReports />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check that the content is rendered
    expect(screen.getByText('Appointment Reports')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/2024-03-20/)).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('handles error when fetching appointments', async () => {
    mockAxiosInstance.get.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<AppointmentReports />);

    await waitFor(() => {
      expect(screen.getByText('Error loading appointments')).toBeInTheDocument();
    });
  });

  it('allows filtering appointments by date', async () => {
    const mockAppointments = [
      {
        id: 1,
        patientName: 'John Doe',
        date: '2024-03-20',
        time: '10:00',
        status: 'completed'
      }
    ];

    mockAxiosInstance.get.mockResolvedValueOnce({ data: mockAppointments });

    render(<AppointmentReports />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const dateInput = screen.getByLabelText(/Filter by date/i);
    fireEvent.change(dateInput, { target: { value: '2024-03-20' } });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
}); 