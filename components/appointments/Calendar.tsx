import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, DateSelectArg } from '@fullcalendar/core';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

interface Appointment {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  isVirtual: boolean;
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

interface CalendarProps {
  onEventClick?: (appointment: Appointment) => void;
  onSelectSlot?: (start: Date, end: Date) => void;
  doctorId?: string;
  patientId?: string;
}

export default function Calendar({ onEventClick, onSelectSlot, doctorId, patientId }: CalendarProps) {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [doctorId, patientId]);

  const fetchAppointments = async () => {
    try {
      let url = '/api/appointments';
      const params = new URLSearchParams();
      
      if (doctorId) params.append('doctorId', doctorId);
      if (patientId) params.append('patientId', patientId);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (arg: EventClickArg) => {
    const appointment = appointments.find(apt => apt.id === arg.event.id);
    if (appointment && onEventClick) {
      onEventClick(appointment);
    }
  };

  const handleSelect = (arg: DateSelectArg) => {
    if (onSelectSlot) {
      onSelectSlot(arg.start, arg.end);
    }
  };

  const events = appointments.map(appointment => ({
    id: appointment.id,
    title: appointment.title,
    start: new Date(`${appointment.date}T${appointment.startTime}`),
    end: new Date(`${appointment.date}T${appointment.endTime}`),
    backgroundColor: getEventColor(appointment.status),
    borderColor: getEventColor(appointment.status),
    extendedProps: {
      isVirtual: appointment.isVirtual,
      status: appointment.status,
      patient: appointment.patient,
      doctor: appointment.doctor,
    },
  }));

  return (
    <div className="h-full bg-white rounded-lg shadow p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        eventClick={handleEventClick}
        select={handleSelect}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        allDaySlot={false}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        height="auto"
        expandRows={true}
        stickyHeaderDates={true}
        nowIndicator={true}
        eventContent={renderEventContent}
        loading={loading}
      />
    </div>
  );
}

function renderEventContent(eventInfo: any) {
  const { isVirtual, patient, doctor } = eventInfo.event.extendedProps;
  
  return (
    <div className="p-1 overflow-hidden">
      <div className="font-semibold text-sm truncate">
        {eventInfo.event.title}
      </div>
      <div className="text-xs truncate">
        {isVirtual && '🎥 '}
        {patient?.name} with Dr. {doctor?.name}
      </div>
    </div>
  );
}

function getEventColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'SCHEDULED':
      return '#3B82F6'; // blue-500
    case 'COMPLETED':
      return '#10B981'; // emerald-500
    case 'CANCELLED':
      return '#EF4444'; // red-500
    case 'RESCHEDULED':
      return '#F59E0B'; // amber-500
    default:
      return '#6B7280'; // gray-500
  }
} 