import React from "react";
import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import "@testing-library/jest-dom";
import "./suppress-act-warnings";

// Import our axios mock
const axios = require("./__mocks__/axios");

// Simple component that fetches user data
function UserData() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/user/1");
        if (isMounted) {
          setUser(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to fetch user");
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">{error}</div>;

  return (
    <div>
      <h1>User Profile</h1>
      {user && (
        <div data-testid="user-profile">
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
        </div>
      )}
    </div>
  );
}

// Helper function for rendering components with async operations
async function renderWithAsync(Component) {
  const queries = render(<Component />);

  // If the component shows loading at first, wait for it to disappear
  if (screen.queryByTestId("loading")) {
    await waitForElementToBeRemoved(() => screen.queryByTestId("loading"));
  }

  return queries;
}

// Tests
describe("UserData Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays loading state initially", async () => {
    // Don't resolve the axios promise yet
    let resolvePromise;
    axios.get.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );

    render(<UserData />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();

    // Now resolve the promise to clean up
    resolvePromise({ data: { name: "John Doe", email: "john@example.com" } });
  });

  it("displays user data after successful API call", async () => {
    // Mock the API response
    const mockUser = { name: "John Doe", email: "john@example.com" };
    axios.get.mockResolvedValueOnce({ data: mockUser });

    // Render and wait for loading to finish
    await renderWithAsync(UserData);

    // Check that the correct API endpoint was called
    expect(axios.get).toHaveBeenCalledWith("/api/user/1");

    // Check that user data is displayed correctly
    expect(screen.getByTestId("user-profile")).toBeInTheDocument();
    expect(screen.getByText("Name: John Doe")).toBeInTheDocument();
    expect(screen.getByText("Email: john@example.com")).toBeInTheDocument();
  });

  it("displays error message when API call fails", async () => {
    // Mock a failed API call
    axios.get.mockRejectedValueOnce(new Error("API Error"));

    // Render and wait for loading to finish
    await renderWithAsync(UserData);

    // Check that the correct API endpoint was called
    expect(axios.get).toHaveBeenCalledWith("/api/user/1");
    expect(screen.getByTestId("error")).toBeInTheDocument();
    expect(screen.getByText("Failed to fetch user")).toBeInTheDocument();
  });
});
