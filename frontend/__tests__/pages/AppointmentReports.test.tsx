import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppointmentReports from '../../pages/AppointmentReports';
import { api } from '../../services/api';

jest.mock('../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('AppointmentReports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders appointment reports page', async () => {
    const mockAppointments = [
      {
        id: 1,
        patientName: 'John Doe',
        date: '2024-03-20',
        time: '10:00',
        status: 'completed'
      }
    ];

    mockedApi.get.mockResolvedValueOnce({ data: mockAppointments });

    render(<AppointmentReports />);

    expect(screen.getByText(/Appointment Reports/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('2024-03-20')).toBeInTheDocument();
      expect(screen.getByText('10:00')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
    });
  });

  it('handles error when fetching appointments', async () => {
    mockedApi.get.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<AppointmentReports />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading appointments/i)).toBeInTheDocument();
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

    mockedApi.get.mockResolvedValueOnce({ data: mockAppointments });

    render(<AppointmentReports />);

    const dateInput = screen.getByLabelText(/Filter by date/i);
    fireEvent.change(dateInput, { target: { value: '2024-03-20' } });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
}); 