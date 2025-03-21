import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import Calendar from '@/components/appointments/Calendar';
import AppointmentModal from '@/components/appointments/AppointmentModal';
import { UserRole } from '@prisma/client';

interface Appointment {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  isVirtual: boolean;
  virtualLink?: string;
  status: string;
  patient: {
    id: string;
    name: string;
  };
  doctor: {
    id: string;
    name: string;
  };
}

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  const handleEventClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleSelectSlot = (start: Date, end: Date) => {
    // Only staff, admin, and doctors can create appointments
    if (!session?.user?.role || ![UserRole.STAFF, UserRole.ADMIN, UserRole.DOCTOR].includes(session.user.role as UserRole)) {
      toast.error('You do not have permission to create appointments');
      return;
    }

    setSelectedSlot({ start, end });
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      const url = selectedAppointment
        ? `/api/appointments/${selectedAppointment.id}`
        : '/api/appointments';

      const method = selectedAppointment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save appointment');
      }

      setIsModalOpen(false);
      setSelectedAppointment(null);
      setSelectedSlot(null);
      toast.success(`Appointment ${selectedAppointment ? 'updated' : 'created'} successfully`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete appointment');
      }

      setIsModalOpen(false);
      setSelectedAppointment(null);
      toast.success('Appointment deleted successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getInitialAppointmentData = () => {
    if (selectedAppointment) {
      return selectedAppointment;
    }

    if (selectedSlot) {
      return {
        date: selectedSlot.start.toISOString().split('T')[0],
        startTime: selectedSlot.start.toTimeString().slice(0, 5),
        endTime: selectedSlot.end.toTimeString().slice(0, 5),
        status: 'SCHEDULED',
        isVirtual: false,
      };
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Appointments
            </h2>
          </div>
          {session?.user?.role && [UserRole.STAFF, UserRole.ADMIN, UserRole.DOCTOR].includes(session.user.role as UserRole) && (
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedAppointment(null);
                  setSelectedSlot(null);
                  setIsModalOpen(true);
                }}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Appointment
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          <Calendar
            onEventClick={handleEventClick}
            onSelectSlot={handleSelectSlot}
            doctorId={session?.user?.role === UserRole.DOCTOR ? session.user.id : undefined}
            patientId={session?.user?.role === UserRole.PATIENT ? session.user.id : undefined}
          />
        </div>

        <AppointmentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAppointment(null);
            setSelectedSlot(null);
          }}
          appointment={getInitialAppointmentData()}
          onSubmit={handleSubmit}
          title={selectedAppointment ? 'Edit Appointment' : 'Create Appointment'}
        />
      </div>
    </div>
  );
} 