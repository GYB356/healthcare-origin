import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AppointmentReports from "@/app/(dashboard)/appointments/reports/page";
import { fetchApi } from "@/lib/api";

// Mock the API module
jest.mock("@/lib/api", () => ({
  fetchApi: jest.fn(),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

describe("AppointmentReports", () => {
  const mockReports = [
    {
      id: "1",
      date: new Date("2024-03-20").toISOString(),
      patientName: "John Doe",
      doctorName: "Dr. Smith",
      status: "COMPLETED",
      diagnosis: "Common Cold",
      prescription: "Rest and fluids",
    },
    {
      id: "2",
      date: new Date("2024-03-21").toISOString(),
      patientName: "Jane Smith",
      doctorName: "Dr. Johnson",
      status: "CANCELLED",
      diagnosis: null,
      prescription: null,
    },
  ];

  beforeEach(() => {
    (fetchApi as jest.Mock).mockResolvedValue({ reports: mockReports });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders appointment reports correctly", async () => {
    render(<AppointmentReports />);

    await waitFor(() => {
      expect(screen.getByText("Appointment Reports")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Dr. Smith")).toBeInTheDocument();
      expect(screen.getByText("Common Cold")).toBeInTheDocument();
    });
  });

  it("displays status badges with correct colors", async () => {
    render(<AppointmentReports />);

    await waitFor(() => {
      const completedBadge = screen.getByText("COMPLETED");
      const cancelledBadge = screen.getByText("CANCELLED");

      expect(completedBadge).toHaveClass("bg-green-500");
      expect(cancelledBadge).toHaveClass("bg-red-500");
    });
  });

  it("handles empty reports gracefully", async () => {
    (fetchApi as jest.Mock).mockResolvedValueOnce({ reports: [] });

    render(<AppointmentReports />);

    await waitFor(() => {
      expect(screen.getByText("No appointment reports found")).toBeInTheDocument();
    });
  });

  it("handles API errors gracefully", async () => {
    (fetchApi as jest.Mock).mockRejectedValueOnce(new Error("Failed to fetch"));

    render(<AppointmentReports />);

    await waitFor(() => {
      expect(screen.getByText("Error loading reports")).toBeInTheDocument();
    });
  });
});
