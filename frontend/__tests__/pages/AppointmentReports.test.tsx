/**
 * AppointmentReports Component Tests
 *
 * These tests cover the AppointmentReports component functionality:
 * - Loading state
 * - Error handling
 * - Data fetching
 * - Filtering capabilities
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import "../../suppress-act-warnings";
import AppointmentReports from "../../pages/AppointmentReports";

// Create a dedicated API mock for these tests
const apiMock = {
  get: jest.fn(),
};

// Mock the API service
jest.mock("../../services/api", () => ({
  api: apiMock,
}));

describe("AppointmentReports", () => {
  // Sample test data
  const mockAppointments = [
    {
      id: 1,
      patientName: "John Doe",
      date: "2024-03-20",
      time: "10:00",
      status: "completed",
    },
    {
      id: 2,
      patientName: "Jane Smith",
      date: "2024-03-25",
      time: "14:30",
      status: "scheduled",
    },
  ];

  // Setup and teardown
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("Loading State", () => {
    it("shows loading indicator initially", () => {
      // Setup - API call that never resolves to keep the component in loading state
      apiMock.get.mockImplementationOnce(() => new Promise(() => {}));

      // Render component
      render(<AppointmentReports />);

      // Assert
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("shows error message when API call fails", async () => {
      // Setup - API call that rejects with an error
      apiMock.get.mockRejectedValueOnce(new Error("Failed to fetch"));

      // Render component
      render(<AppointmentReports />);

      // Wait for the error message to appear
      await waitFor(() => {
        expect(screen.getByText("Error loading appointments")).toBeInTheDocument();
      });

      // Verify API was called
      expect(apiMock.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("Data Display", () => {
    it("renders appointment data when API call succeeds", async () => {
      // Setup - API call that resolves with mock data
      apiMock.get.mockResolvedValueOnce({ data: mockAppointments });

      // Render component
      render(<AppointmentReports />);

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      // Verify API was called
      expect(apiMock.get).toHaveBeenCalledTimes(1);

      // Check that the content is rendered
      expect(screen.getByText("Appointment Reports")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText(/2024-03-20/)).toBeInTheDocument();
      expect(screen.getByText("10:00")).toBeInTheDocument();
      expect(screen.getByText("completed")).toBeInTheDocument();

      // Check second appointment is also displayed
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });
  });

  describe("Filtering", () => {
    it("filters appointments by date", async () => {
      // Setup - API call that resolves with mock data
      apiMock.get.mockResolvedValueOnce({ data: mockAppointments });

      // Render component
      render(<AppointmentReports />);

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      });

      // Verify both appointments are initially shown
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();

      // Apply date filter
      const dateInput = screen.getByLabelText(/Filter by date/i);
      fireEvent.change(dateInput, { target: { value: "2024-03-20" } });

      // Check that only the filtered appointment is shown
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();

      // Change filter to another date
      fireEvent.change(dateInput, { target: { value: "2024-03-25" } });

      // Check that the other appointment is now shown
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();

      // Clear filter
      fireEvent.change(dateInput, { target: { value: "" } });

      // Check that all appointments are shown again
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });
  });
});
