import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { format } from "date-fns";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AppointmentFormData {
  title: string;
  notes?: string;
  date: string;
  startTime: string;
  endTime: string;
  patientId: string;
  doctorId: string;
  isVirtual: boolean;
  virtualLink?: string;
  status: string;
}

interface AppointmentFormProps {
  appointment?: AppointmentFormData;
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  onCancel: () => void;
}

export default function AppointmentForm({ appointment, onSubmit, onCancel }: AppointmentFormProps) {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<AppointmentFormData>({
    defaultValues: appointment || {
      title: "",
      notes: "",
      date: format(new Date(), "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "10:00",
      isVirtual: false,
      status: "SCHEDULED",
    },
  });

  const isVirtual = watch("isVirtual");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch doctors
      const doctorsResponse = await fetch("/api/users?role=DOCTOR");
      if (!doctorsResponse.ok) throw new Error("Failed to fetch doctors");
      const doctorsData = await doctorsResponse.json();
      setDoctors(doctorsData);

      // Fetch patients
      const patientsResponse = await fetch("/api/users?role=PATIENT");
      if (!patientsResponse.ok) throw new Error("Failed to fetch patients");
      const patientsData = await patientsResponse.json();
      setPatients(patientsData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  const onFormSubmit = async (data: AppointmentFormData) => {
    try {
      setLoading(true);
      await onSubmit(data);
      toast.success("Appointment saved successfully");
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast.error("Failed to save appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          {...register("title", { required: "Title is required" })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            {...register("date", { required: "Date is required" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            {...register("status")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RESCHEDULED">Rescheduled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="time"
            id="startTime"
            {...register("startTime", { required: "Start time is required" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.startTime && (
            <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
            End Time
          </label>
          <input
            type="time"
            id="endTime"
            {...register("endTime", { required: "End time is required" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">
            Doctor
          </label>
          <select
            id="doctorId"
            {...register("doctorId", { required: "Doctor is required" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                Dr. {doctor.name}
              </option>
            ))}
          </select>
          {errors.doctorId && (
            <p className="mt-1 text-sm text-red-600">{errors.doctorId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
            Patient
          </label>
          <select
            id="patientId"
            {...register("patientId", { required: "Patient is required" })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
          {errors.patientId && (
            <p className="mt-1 text-sm text-red-600">{errors.patientId.message}</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isVirtual"
            {...register("isVirtual")}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isVirtual" className="ml-2 block text-sm text-gray-700">
            Virtual Appointment
          </label>
        </div>

        {isVirtual && (
          <div className="mt-4">
            <label htmlFor="virtualLink" className="block text-sm font-medium text-gray-700">
              Virtual Meeting Link
            </label>
            <input
              type="url"
              id="virtualLink"
              {...register("virtualLink", {
                required: isVirtual ? "Virtual meeting link is required" : false,
                pattern: {
                  value: /^https?:\/\/.+/i,
                  message: "Please enter a valid URL",
                },
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://meet.example.com/room"
            />
            {errors.virtualLink && (
              <p className="mt-1 text-sm text-red-600">{errors.virtualLink.message}</p>
            )}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          {...register("notes")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
