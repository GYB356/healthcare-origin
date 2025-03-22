import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface Appointment {
  id: number;
  patientName: string;
  date: string;
  time: string;
  status: string;
}

const AppointmentReports: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string>('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/appointments');
        setAppointments(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error loading appointments');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const filteredAppointments = filterDate
    ? appointments.filter(apt => apt.date === filterDate)
    : appointments;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading appointments</div>;
  }

  return (
    <div>
      <h1>Appointment Reports</h1>
      
      <div>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          aria-label="Filter by date"
        />
      </div>

      <div>
        {filteredAppointments.map((appointment) => (
          <div key={appointment.id}>
            <h3>{appointment.patientName}</h3>
            <p>Date: {appointment.date}</p>
            <p>Time: {appointment.time}</p>
            <p>Status: {appointment.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentReports; 