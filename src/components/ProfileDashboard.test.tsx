import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";

// Import the component to test
import ProfileDashboard from "./ProfileDashboard";

// Mock contexts
const AuthContext = React.createContext(null);
const ThemeContext = React.createContext(null);
const NotificationContext = React.createContext(null);

// Mock API responses
const mockUserData = {
  id: "123",
  name: "John Doe",
  email: "john@example.com",
  appointments: [
    { id: "apt1", date: "2023-10-01", doctor: "Dr. Smith", status: "confirmed" },
    { id: "apt2", date: "2023-11-15", doctor: "Dr. Johnson", status: "pending" },
  ],
};

const mockErrorResponse = {
  message: "Failed to fetch user data",
};

// Setup MSW server to intercept API calls
const server = setupServer(
  rest.get("/api/user/:userId", (req, res, ctx) => {
    const { userId } = req.params;

    if (userId === "123") {
      return res(ctx.json(mockUserData));
    } else if (userId === "error") {
      return res(ctx.status(500), ctx.json(mockErrorResponse));
    } else {
      return res(ctx.status(404), ctx.json({ message: "User not found" }));
    }
  }),

  rest.post("/api/appointments/cancel/:id", (req, res, ctx) => {
    const { id } = req.params;

    if (id === "apt1") {
      return res(ctx.json({ success: true }));
    } else {
      return res(ctx.status(400), ctx.json({ message: "Cannot cancel appointment" }));
    }
  }),
);

// Mock context providers
const mockAuthValues = {
  authenticated: true,
  user: { id: "123", name: "John Doe" },
  login: jest.fn(),
  logout: jest.fn(),
};

const mockThemeValues = {
  theme: "light",
  toggleTheme: jest.fn(),
};

const mockNotificationValues = {
  notifications: [],
  addNotification: jest.fn(),
  clearNotifications: jest.fn(),
};

// Test wrapper component that provides all necessary contexts
const AllTheProviders = ({ children, authValues, themeValues, notificationValues }) => {
  return (
    <AuthContext.Provider value={authValues || mockAuthValues}>
      <ThemeContext.Provider value={themeValues || mockThemeValues}>
        <NotificationContext.Provider value={notificationValues || mockNotificationValues}>
          {children}
        </NotificationContext.Provider>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
};

// Custom render function that includes providers
const customRender = (
  ui,
  { authValues, themeValues, notificationValues, ...renderOptions } = {},
) => {
  return render(
    <AllTheProviders
      authValues={authValues}
      themeValues={themeValues}
      notificationValues={notificationValues}
    >
      {ui}
    </AllTheProviders>,
    renderOptions,
  );
};

// Setup and teardown for MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("ProfileDashboard Component", () => {
  // Test initial rendering with default contexts
  test("renders user profile information when authenticated", async () => {
    customRender(<ProfileDashboard />);

    // Check for loading state
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // Wait for API response to load
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    // Check that user data is displayed
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Dr. Smith")).toBeInTheDocument();
    expect(screen.getByText("Dr. Johnson")).toBeInTheDocument();
  });

  // Test unauthenticated state
  test("redirects to login when user is not authenticated", () => {
    customRender(<ProfileDashboard />, {
      authValues: {
        authenticated: false,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
      },
    });

    expect(screen.getByText("Please login to view your profile")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  // Test theme context changes
  test("applies correct theme styles based on theme context", () => {
    // Test light theme
    const { rerender } = customRender(<ProfileDashboard />);

    expect(screen.getByTestId("dashboard-container")).toHaveClass("light-theme");

    // Test dark theme
    rerender(
      <AllTheProviders themeValues={{ theme: "dark", toggleTheme: jest.fn() }}>
        <ProfileDashboard />
      </AllTheProviders>,
    );

    expect(screen.getByTestId("dashboard-container")).toHaveClass("dark-theme");
  });

  // Test API error handling
  test("displays error message when API call fails", async () => {
    // Mock a failed API response
    server.use(
      rest.get("/api/user/:userId", (req, res, ctx) => {
        return res(ctx.status(500), ctx.json(mockErrorResponse));
      }),
    );

    customRender(<ProfileDashboard />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText("Failed to fetch user data")).toBeInTheDocument();
    });

    // Check for retry button
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  // Test user interaction - appointment cancellation
  test("handles appointment cancellation correctly", async () => {
    customRender(<ProfileDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    // Find and click the cancel button for the first appointment
    const cancelButtons = screen.getAllByRole("button", { name: /cancel appointment/i });
    fireEvent.click(cancelButtons[0]);

    // Should show confirmation dialog
    expect(
      screen.getByText("Are you sure you want to cancel this appointment?"),
    ).toBeInTheDocument();

    // Confirm cancellation
    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText("Appointment cancelled successfully")).toBeInTheDocument();
    });

    // Check that notification was added
    expect(mockNotificationValues.addNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
        message: "Appointment cancelled successfully",
      }),
    );
  });

  // Test failed appointment cancellation
  test("handles appointment cancellation failure", async () => {
    customRender(<ProfileDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    // Find and click the cancel button for the second appointment (which will fail)
    const cancelButtons = screen.getAllByRole("button", { name: /cancel appointment/i });
    fireEvent.click(cancelButtons[1]);

    // Confirm cancellation
    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText("Cannot cancel appointment")).toBeInTheDocument();
    });

    // Check that error notification was added
    expect(mockNotificationValues.addNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "error",
        message: "Cannot cancel appointment",
      }),
    );
  });

  // Test context updates
  test("responds to auth context updates", async () => {
    const { rerender } = customRender(<ProfileDashboard />);

    // Initially authenticated
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Update to unauthenticated
    rerender(
      <AllTheProviders
        authValues={{
          authenticated: false,
          user: null,
          login: jest.fn(),
          logout: jest.fn(),
        }}
      >
        <ProfileDashboard />
      </AllTheProviders>,
    );

    // Should show login prompt
    expect(screen.getByText("Please login to view your profile")).toBeInTheDocument();
  });

  // Test multiple context combinations
  test("handles complex context combinations correctly", async () => {
    // Test with authenticated user but in dark mode with notifications
    const notificationsWithItems = {
      notifications: [
        { id: "n1", type: "info", message: "New feature available" },
        { id: "n2", type: "warning", message: "Your subscription expires soon" },
      ],
      addNotification: jest.fn(),
      clearNotifications: jest.fn(),
    };

    customRender(<ProfileDashboard />, {
      themeValues: { theme: "dark", toggleTheme: jest.fn() },
      notificationValues: notificationsWithItems,
    });

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Check that theme is applied
    expect(screen.getByTestId("dashboard-container")).toHaveClass("dark-theme");

    // Check that notifications are displayed
    expect(screen.getByText("New feature available")).toBeInTheDocument();
    expect(screen.getByText("Your subscription expires soon")).toBeInTheDocument();
  });

  // Test conditional rendering based on user permissions
  test("renders admin controls only for admin users", async () => {
    // Regular user first
    customRender(<ProfileDashboard />);

    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    // Admin controls should not be visible
    expect(screen.queryByTestId("admin-controls")).not.toBeInTheDocument();

    // Now with admin user
    customRender(<ProfileDashboard />, {
      authValues: {
        authenticated: true,
        user: { id: "123", name: "John Doe", role: "admin" },
        login: jest.fn(),
        logout: jest.fn(),
      },
    });

    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    // Admin controls should be visible
    expect(screen.getByTestId("admin-controls")).toBeInTheDocument();
  });
});
