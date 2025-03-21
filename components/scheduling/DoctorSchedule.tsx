import React, { useState, useEffect } from 'react';
import { Calendar } from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { Schedule } from '@prisma/client';

interface TimeSlot {
  id: string;
  start: Date;
  end: Date;
  title: string;
}

export default function DoctorSchedule() {
  const { data: session } = useSession();
  const [schedules, setSchedules] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedule');
      const data = await response.json();
      setSchedules(data.schedules.map((schedule: Schedule) => ({
        id: schedule.id,
        start: new Date(schedule.startTime),
        end: new Date(schedule.endTime),
        title: 'Available',
      })));
    } catch (error) {
      toast.error('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (selectInfo: any) => {
    const title = 'Available';
    const calendarApi = selectInfo.view.calendar;

    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: selectInfo.start,
          endTime: selectInfo.end,
          doctorId: session?.user?.id,
        }),
      });

      if (response.ok) {
        calendarApi.addEvent({
          id: String(Date.now()),
          title,
          start: selectInfo.start,
          end: selectInfo.end,
        });
        toast.success('Time slot added successfully');
        fetchSchedules();
      } else {
        toast.error('Failed to add time slot');
      }
    } catch (error) {
      toast.error('Error adding time slot');
    }
  };

  const handleEventClick = async (clickInfo: any) => {
    if (confirm('Would you like to remove this time slot?')) {
      try {
        const response = await fetch(`/api/schedule/${clickInfo.event.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          clickInfo.event.remove();
          toast.success('Time slot removed successfully');
        } else {
          toast.error('Failed to remove time slot');
        }
      } catch (error) {
        toast.error('Error removing time slot');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Manage Schedule</h2>
      <div className="h-[600px]">
        <Calendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={schedules}
          select={handleSelect}
          eventClick={handleEventClick}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          slotDuration="00:30:00"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay',
          }}
        />
      </div>
    </div>
  );
} 