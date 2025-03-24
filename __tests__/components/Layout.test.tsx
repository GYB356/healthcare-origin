import { render, screen } from "@testing-library/react";
import React from "react";
import Layout from "@/components/Layout";

// Mock the AuthContext hook
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Import useAuth after mocking
import { useAuth } from "@/contexts/AuthContext";

// Mock child component
jest.mock("@/components/Sidebar", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-sidebar">Sidebar</div>,
}));

// Mock navigation component
jest.mock("@/components/Navigation", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-navigation">Navigation</div>,
}));

describe("Layout Component", () => {
  beforeEach(() => {
    // Setup default auth mock
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: "123",
        username: "testuser",
        role: "admin",
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders the layout with navigation and sidebar when authenticated", () => {
    render(
      <Layout>
        <div data-testid="test-children">Content</div>
      </Layout>,
    );

    // Check if navigation and sidebar are rendered
    expect(screen.getByTestId("mock-navigation")).toBeInTheDocument();
    expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();

    // Check if children are rendered
    expect(screen.getByTestId("test-children")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  test("renders only children without navigation and sidebar when not authenticated", () => {
    // Override the auth mock to return not authenticated
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    render(
      <Layout>
        <div data-testid="test-children">Content</div>
      </Layout>,
    );

    // Navigation and sidebar should not be rendered
    expect(screen.queryByTestId("mock-navigation")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mock-sidebar")).not.toBeInTheDocument();

    // Children should still be rendered
    expect(screen.getByTestId("test-children")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});
