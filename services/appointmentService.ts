/**
 * Appointment Service
 */
import axios from "axios";
import { Appointment, AppointmentStatus } from "@/types/Appointment";
import { sendNotification } from "@/services/notificationService";

/**
 * Create a new appointment
 */
export const createAppointment = async (
  appointmentData: Partial<Appointment>,
): Promise<{
  success: boolean;
  appointment?: Appointment;
  error?: string;
}> => {
  try {
    // Validate required fields
    if (!appointmentData.patientId || !appointmentData.doctorId || !appointmentData.date) {
      return {
        success: false,
        error: "Patient ID, Doctor ID, and appointment date are required",
      };
    }

    const response = await axios.post("/api/appointments", appointmentData);

    return {
      success: true,
      appointment: response.data,
    };
  } catch (error: any) {
    // Handle error response from API
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || "Failed to create appointment",
      };
    }

    // Generic error handling
    return {
      success: false,
      error: "Failed to create appointment. Please try again.",
    };
  }
};

/**
 * Get appointments with optional filters
 */
export const getAppointments = async (
  filters: {
    patientId?: string;
    doctorId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: AppointmentStatus;
    page?: number;
    limit?: number;
  } = {},
): Promise<{
  success: boolean;
  appointments: Appointment[];
  error?: string;
}> => {
  try {
    // Process Date objects for API
    const params: any = { ...filters };
    if (params.startDate instanceof Date) {
      params.startDate = params.startDate.toISOString();
    }
    if (params.endDate instanceof Date) {
      params.endDate = params.endDate.toISOString();
    }

    const response = await axios.get("/api/appointments", { params });

    return {
      success: true,
      appointments: response.data,
    };
  } catch (error: any) {
    // Handle error response from API
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || "Failed to fetch appointments",
        appointments: [],
      };
    }

    // Generic error handling
    return {
      success: false,
      error: "Failed to fetch appointments. Please try again.",
      appointments: [],
    };
  }
};

/**
 * Get a single appointment by ID
 */
export const getAppointmentById = async (
  id: string,
): Promise<{
  success: boolean;
  appointment?: Appointment;
  error?: string;
}> => {
  try {
    const response = await axios.get(`/api/appointments/${id}`);

    return {
      success: true,
      appointment: response.data,
    };
  } catch (error: any) {
    // Handle error response from API
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || "Failed to fetch appointment",
      };
    }

    // Generic error handling
    return {
      success: false,
      error: "Failed to fetch appointment. Please try again.",
    };
  }
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (
  id: string,
  status: AppointmentStatus,
): Promise<{
  success: boolean;
  appointment?: Appointment;
  error?: string;
}> => {
  try {
    const response = await axios.patch(`/api/appointments/${id}/status`, { status });

    if (response.data) {
      // Send notification about status update
      await sendNotification({
        recipientId: response.data.patientId,
        type: "APPOINTMENT_UPDATE",
        title: "Appointment Status Update",
        message: `Your appointment status has changed to ${status}`,
        data: {
          appointmentId: id,
          status: status,
        },
      });

      return {
        success: true,
        appointment: response.data,
      };
    }

    return {
      success: false,
      error: "Failed to update appointment status",
    };
  } catch (error: any) {
    // Handle error response from API
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || "Failed to update appointment status",
      };
    }

    // Generic error handling
    return {
      success: false,
      error: "Failed to update appointment status. Please try again.",
    };
  }
};

/**
 * Delete an appointment
 */
export const deleteAppointment = async (
  id: string,
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    // Get appointment info before deleting
    const appointmentResponse = await axios.get(`/api/appointments/${id}`);
    const appointment = appointmentResponse.data;

    // Delete the appointment
    const response = await axios.delete(`/api/appointments/${id}`);

    if (response.data && response.data.success) {
      // Send cancellation notification
      if (appointment) {
        await sendNotification({
          recipientId: appointment.patientId,
          type: "APPOINTMENT_CANCELLED",
          title: "Appointment Cancelled",
          message: "Your appointment has been cancelled",
          data: {
            appointmentId: id,
            originalDate: appointment.date,
          },
        });

        // Also notify doctor
        await sendNotification({
          recipientId: appointment.doctorId,
          type: "APPOINTMENT_CANCELLED",
          title: "Appointment Cancelled",
          message: "An appointment has been cancelled",
          data: {
            appointmentId: id,
            patientId: appointment.patientId,
            originalDate: appointment.date,
          },
        });
      }

      return { success: true };
    }

    return {
      success: false,
      error: "Failed to delete appointment",
    };
  } catch (error: any) {
    // Handle error response from API
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || "Failed to delete appointment",
      };
    }

    // Generic error handling
    return {
      success: false,
      error: "Failed to delete appointment. Please try again.",
    };
  }
};

/**
 * Send appointment-related notification
 */
export const sendAppointmentNotification = async (options: {
  appointmentId: string;
  recipientId: string;
  message: string;
  type: "REMINDER" | "CHANGE" | "CANCELLATION";
}): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const result = await sendNotification({
      recipientId: options.recipientId,
      type: `APPOINTMENT_${
        options.type === "REMINDER"
          ? "REMINDER"
          : options.type === "CHANGE"
            ? "CHANGE"
            : "CANCELLED"
      }`,
      title: `Appointment ${
        options.type === "REMINDER"
          ? "Reminder"
          : options.type === "CHANGE"
            ? "Change"
            : "Cancellation"
      }`,
      message: options.message,
      data: {
        appointmentId: options.appointmentId,
        type: options.type,
      },
    });

    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to send notification",
    };
  }
};

export default {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment,
  sendAppointmentNotification,
};
