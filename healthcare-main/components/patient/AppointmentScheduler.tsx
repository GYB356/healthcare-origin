import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function AppointmentScheduler() {
  const { data: session } = useSession();
  const [date, setDate] = useState<Date>(new Date());
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<string>("regular");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && date) {
      fetchTimeSlots();
    }
  }, [selectedDoctor, date]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors");
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setError("Failed to load doctors");
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const response = await fetch(
        `/api/appointments/slots?doctorId=${selectedDoctor}&date=${date.toISOString()}`,
      );
      const data = await response.json();
      setTimeSlots(data);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      setError("Failed to load available time slots");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          date: date.toISOString(),
          time: selectedTime,
          type: appointmentType,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to schedule appointment");
      }

      // Reset form
      setDate(new Date());
      setSelectedDoctor("");
      setSelectedTime("");
      setAppointmentType("regular");
      setNotes("");
      setTimeSlots([]);

      alert("Appointment scheduled successfully!");
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      setError("Failed to schedule appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule an Appointment</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Doctor Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Doctor</label>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Choose a doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
              </option>
            ))}
          </select>
        </div>

        {/* Calendar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
          <Calendar onChange={setDate} value={date} minDate={new Date()} className="mx-auto" />
        </div>

        {/* Time Slots */}
        {selectedDoctor && date && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Time</label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {timeSlots.map((slot, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedTime(slot.time)}
                  className={`p-2 rounded ${
                    selectedTime === slot.time
                      ? "bg-blue-500 text-white"
                      : slot.available
                        ? "bg-gray-100 hover:bg-gray-200"
                        : "bg-gray-300 cursor-not-allowed"
                  }`}
                  disabled={!slot.available}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Appointment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Appointment Type</label>
          <select
            value={appointmentType}
            onChange={(e) => setAppointmentType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="regular">Regular Checkup</option>
            <option value="follow-up">Follow-up</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Error Message */}
        {error && <div className="text-red-500 text-sm">{error}</div>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !selectedDoctor || !selectedTime}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading || !selectedDoctor || !selectedTime
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Scheduling..." : "Schedule Appointment"}
        </button>
      </form>
    </div>
  );
}
