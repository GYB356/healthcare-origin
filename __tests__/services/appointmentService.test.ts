import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment,
  sendAppointmentNotification,
} from "@/services/appointmentService";
import { Appointment, AppointmentStatus } from "@/types/Appointment";
import { setupTestDB, clearTestDB, closeTestDB } from "@/utils/testDbHelper";
import axios from "axios";

// Mock axios for API calls
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock notification service
jest.mock("@/services/notificationService", () => ({
  sendNotification: jest.fn().mockResolvedValue({ success: true }),
}));
import { sendNotification } from "@/services/notificationService";

describe("Appointment Service", () => {
  // Sample appointment data
  const mockAppointment: Partial<Appointment> = {
    patientId: "123",
    doctorId: "456",
    date: new Date("2025-04-15T10:00:00"),
    duration: 30,
    status: AppointmentStatus.SCHEDULED,
    reason: "Regular checkup",
    notes: "First-time patient",
  };

  const mockAppointmentResponse = {
    ...mockAppointment,
    id: "appt-789",
    createdAt: new Date("2025-04-01T12:00:00"),
    updatedAt: new Date("2025-04-01T12:00:00"),
  };

  // Setup and teardown for MongoDB-dependent tests
  beforeAll(async () => {
    await setupTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  // Tests for createAppointment
  describe("createAppointment", () => {
    it("should create a new appointment successfully", async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockAppointmentResponse });

      const result = await createAppointment(mockAppointment);

      expect(mockedAxios.post).toHaveBeenCalledWith("/api/appointments", mockAppointment);
      expect(result).toEqual({
        success: true,
        appointment: mockAppointmentResponse,
      });
    });

    it("should validate required fields before creating appointment", async () => {
      // Missing required fields
      const invalidAppointment = {
        patientId: "123",
        // Missing doctorId and date
        duration: 30,
      };

      const result = await createAppointment(invalidAppointment as any);

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: expect.stringContaining("required"),
      });
    });

    it("should handle API errors when creating appointment", async () => {
      const errorResponse = {
        response: {
          data: {
            message: "Doctor is not available at the requested time",
          },
          status: 400,
        },
      };

      mockedAxios.post.mockRejectedValueOnce(errorResponse);

      const result = await createAppointment(mockAppointment);

      expect(mockedAxios.post).toHaveBeenCalledWith("/api/appointments", mockAppointment);
      expect(result).toEqual({
        success: false,
        error: "Doctor is not available at the requested time",
      });
    });

    it("should handle network errors gracefully", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

      const result = await createAppointment(mockAppointment);

      expect(result).toEqual({
        success: false,
        error: "Failed to create appointment. Please try again.",
      });
    });
  });

  // Tests for getAppointments
  describe("getAppointments", () => {
    it("should fetch appointments for a patient", async () => {
      const mockAppointments = [mockAppointmentResponse];
      mockedAxios.get.mockResolvedValueOnce({ data: mockAppointments });

      const result = await getAppointments({ patientId: "123" });

      expect(mockedAxios.get).toHaveBeenCalledWith("/api/appointments", {
        params: { patientId: "123" },
      });
      expect(result).toEqual({
        success: true,
        appointments: mockAppointments,
      });
    });

    it("should fetch appointments for a doctor", async () => {
      const mockAppointments = [mockAppointmentResponse];
      mockedAxios.get.mockResolvedValueOnce({ data: mockAppointments });

      const result = await getAppointments({ doctorId: "456" });

      expect(mockedAxios.get).toHaveBeenCalledWith("/api/appointments", {
        params: { doctorId: "456" },
      });
      expect(result).toEqual({
        success: true,
        appointments: mockAppointments,
      });
    });

    it("should handle filtering by date range and status", async () => {
      const mockAppointments = [mockAppointmentResponse];
      const filters = {
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-04-30"),
        status: AppointmentStatus.SCHEDULED,
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockAppointments });

      const result = await getAppointments(filters);

      expect(mockedAxios.get).toHaveBeenCalledWith("/api/appointments", {
        params: {
          startDate: filters.startDate.toISOString(),
          endDate: filters.endDate.toISOString(),
          status: filters.status,
        },
      });
      expect(result).toEqual({
        success: true,
        appointments: mockAppointments,
      });
    });

    it("should handle API errors when fetching appointments", async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          data: { message: "Unauthorized access" },
          status: 401,
        },
      });

      const result = await getAppointments({ patientId: "123" });

      expect(result).toEqual({
        success: false,
        error: "Unauthorized access",
        appointments: [],
      });
    });
  });

  // Tests for getAppointmentById
  describe("getAppointmentById", () => {
    it("should fetch a single appointment by ID", async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockAppointmentResponse });

      const result = await getAppointmentById("appt-789");

      expect(mockedAxios.get).toHaveBeenCalledWith("/api/appointments/appt-789");
      expect(result).toEqual({
        success: true,
        appointment: mockAppointmentResponse,
      });
    });

    it("should handle appointment not found", async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          data: { message: "Appointment not found" },
          status: 404,
        },
      });

      const result = await getAppointmentById("nonexistent-id");

      expect(result).toEqual({
        success: false,
        error: "Appointment not found",
      });
    });
  });

  // Tests for updateAppointmentStatus
  describe("updateAppointmentStatus", () => {
    it("should update appointment status successfully", async () => {
      const updatedAppointment = {
        ...mockAppointmentResponse,
        status: AppointmentStatus.CONFIRMED,
        updatedAt: new Date("2025-04-02T09:00:00"),
      };

      mockedAxios.patch.mockResolvedValueOnce({ data: updatedAppointment });

      const result = await updateAppointmentStatus("appt-789", AppointmentStatus.CONFIRMED);

      expect(mockedAxios.patch).toHaveBeenCalledWith("/api/appointments/appt-789/status", {
        status: AppointmentStatus.CONFIRMED,
      });
      expect(result).toEqual({
        success: true,
        appointment: updatedAppointment,
      });
    });

    it("should trigger notification when status is updated", async () => {
      const updatedAppointment = {
        ...mockAppointmentResponse,
        status: AppointmentStatus.CONFIRMED,
        updatedAt: new Date("2025-04-02T09:00:00"),
      };

      mockedAxios.patch.mockResolvedValueOnce({ data: updatedAppointment });

      await updateAppointmentStatus("appt-789", AppointmentStatus.CONFIRMED);

      // Check if notification service was called
      expect(sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: mockAppointment.patientId,
          type: "APPOINTMENT_UPDATE",
          data: expect.objectContaining({
            appointmentId: "appt-789",
            status: AppointmentStatus.CONFIRMED,
          }),
        }),
      );
    });

    it("should handle validation errors when updating status", async () => {
      mockedAxios.patch.mockRejectedValueOnce({
        response: {
          data: { message: "Invalid status transition" },
          status: 400,
        },
      });

      const result = await updateAppointmentStatus("appt-789", "INVALID_STATUS" as any);

      expect(result).toEqual({
        success: false,
        error: "Invalid status transition",
      });
      expect(sendNotification).not.toHaveBeenCalled();
    });
  });

  // Tests for deleteAppointment
  describe("deleteAppointment", () => {
    it("should delete an appointment successfully", async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

      const result = await deleteAppointment("appt-789");

      expect(mockedAxios.delete).toHaveBeenCalledWith("/api/appointments/appt-789");
      expect(result).toEqual({
        success: true,
      });
    });

    it("should notify users about canceled appointments", async () => {
      // First, mock the get appointment response
      mockedAxios.get.mockResolvedValueOnce({ data: mockAppointmentResponse });
      // Then, mock the delete response
      mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

      await deleteAppointment("appt-789");

      // Check if notification service was called for cancellation
      expect(sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: mockAppointment.patientId,
          type: "APPOINTMENT_CANCELLED",
          data: expect.objectContaining({
            appointmentId: "appt-789",
          }),
        }),
      );
    });

    it("should handle unauthorized deletion attempts", async () => {
      mockedAxios.delete.mockRejectedValueOnce({
        response: {
          data: { message: "Unauthorized to delete this appointment" },
          status: 403,
        },
      });

      const result = await deleteAppointment("appt-789");

      expect(result).toEqual({
        success: false,
        error: "Unauthorized to delete this appointment",
      });
    });
  });

  // Tests for sendAppointmentNotification
  describe("sendAppointmentNotification", () => {
    it("should send reminder notifications successfully", async () => {
      // Implementation of sendNotification already mocked at the top
      const notificationResult = await sendAppointmentNotification({
        appointmentId: "appt-789",
        recipientId: "123",
        message: "Your appointment is tomorrow",
        type: "REMINDER",
      });

      expect(sendNotification).toHaveBeenCalledWith({
        recipientId: "123",
        type: "APPOINTMENT_REMINDER",
        title: "Appointment Reminder",
        message: "Your appointment is tomorrow",
        data: {
          appointmentId: "appt-789",
          type: "REMINDER",
        },
      });

      expect(notificationResult).toEqual({
        success: true,
      });
    });

    it("should handle notification failures", async () => {
      // Override the mock implementation for this specific test
      (sendNotification as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: "Failed to deliver notification",
      });

      const notificationResult = await sendAppointmentNotification({
        appointmentId: "appt-789",
        recipientId: "123",
        message: "Your appointment is tomorrow",
        type: "REMINDER",
      });

      expect(notificationResult).toEqual({
        success: false,
        error: "Failed to deliver notification",
      });
    });
  });
});
