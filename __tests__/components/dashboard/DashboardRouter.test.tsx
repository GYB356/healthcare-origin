import { render, screen } from "@testing-library/react";
import React from "react";
import DashboardRouter from "@/components/dashboard/DashboardRouter";

// Mock the AuthContext hook
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Import useAuth after mocking
import { useAuth } from "@/contexts/AuthContext";

// Mock the different dashboard components
jest.mock("@/components/dashboard/AdminDashboard", () => ({
  __esModule: true,
  default: () => <div data-testid="admin-dashboard">Admin Dashboard</div>,
}));

jest.mock("@/components/dashboard/DoctorDashboard", () => ({
  __esModule: true,
  default: () => <div data-testid="doctor-dashboard">Doctor Dashboard</div>,
}));

jest.mock("@/components/dashboard/PatientDashboard", () => ({
  __esModule: true,
  default: () => <div data-testid="patient-dashboard">Patient Dashboard</div>,
}));

jest.mock("@/components/dashboard/NurseDashboard", () => ({
  __esModule: true,
  default: () => <div data-testid="nurse-dashboard">Nurse Dashboard</div>,
}));

jest.mock("@/components/dashboard/StaffDashboard", () => ({
  __esModule: true,
  default: () => <div data-testid="staff-dashboard">Staff Dashboard</div>,
}));

describe("DashboardRouter Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test("renders AdminDashboard for admin users", () => {
    // Setup the mock implementation for this test
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        role: "admin",
      },
    });

    render(<DashboardRouter />);
    expect(screen.getByTestId("admin-dashboard")).toBeInTheDocument();
  });

  test("renders DoctorDashboard for doctor users", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        role: "doctor",
      },
    });

    render(<DashboardRouter />);
    expect(screen.getByTestId("doctor-dashboard")).toBeInTheDocument();
  });

  test("renders PatientDashboard for patient users", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        role: "patient",
      },
    });

    render(<DashboardRouter />);
    expect(screen.getByTestId("patient-dashboard")).toBeInTheDocument();
  });

  test("renders NurseDashboard for nurse users", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        role: "nurse",
      },
    });

    render(<DashboardRouter />);
    expect(screen.getByTestId("nurse-dashboard")).toBeInTheDocument();
  });

  test("renders StaffDashboard for staff users", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        role: "staff",
      },
    });

    render(<DashboardRouter />);
    expect(screen.getByTestId("staff-dashboard")).toBeInTheDocument();
  });

  test("renders fallback message for unknown role", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        role: "unknown",
      },
    });

    render(<DashboardRouter />);
    expect(screen.getByText(/Invalid user role/i)).toBeInTheDocument();
  });

  test("renders loading message when user is null", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
    });

    render(<DashboardRouter />);
    expect(screen.getByText(/Loading user data/i)).toBeInTheDocument();
  });
});
