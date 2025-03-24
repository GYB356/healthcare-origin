import { loginUser, logoutUser, registerUser, validateToken } from "@/services/authService";
import jwt from "jsonwebtoken";
import { User } from "@/types/User";

// Mock jwt
jest.mock("jsonwebtoken");

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock API calls
jest.mock("axios", () => ({
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
}));

// Import axios after mocking
import axios from "axios";

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("loginUser", () => {
    const mockCredentials = { email: "test@example.com", password: "password123" };
    const mockResponse = {
      data: {
        success: true,
        token: "mock-jwt-token",
        user: {
          id: "123",
          email: "test@example.com",
          role: "doctor",
          name: "Dr. Test",
        },
      },
    };

    it("should successfully login a user with valid credentials", async () => {
      (axios.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await loginUser(mockCredentials);

      expect(axios.post).toHaveBeenCalledWith("/api/auth/login", mockCredentials);
      expect(result).toEqual({
        success: true,
        user: mockResponse.data.user,
      });
      expect(localStorage.setItem).toHaveBeenCalledWith("auth_token", mockResponse.data.token);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "auth_user",
        JSON.stringify(mockResponse.data.user),
      );
    });

    it("should handle login failure with invalid credentials", async () => {
      const errorResponse = {
        response: {
          data: {
            success: false,
            message: "Invalid credentials",
          },
          status: 401,
        },
      };

      (axios.post as jest.Mock).mockRejectedValueOnce(errorResponse);

      const result = await loginUser(mockCredentials);

      expect(axios.post).toHaveBeenCalledWith("/api/auth/login", mockCredentials);
      expect(result).toEqual({
        success: false,
        error: "Invalid credentials",
      });
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it("should handle unexpected errors during login", async () => {
      (axios.post as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const result = await loginUser(mockCredentials);

      expect(axios.post).toHaveBeenCalledWith("/api/auth/login", mockCredentials);
      expect(result).toEqual({
        success: false,
        error: "An error occurred during login. Please try again.",
      });
    });
  });

  describe("logoutUser", () => {
    it("should remove auth data from localStorage on logout", async () => {
      // Set mock data in localStorage first
      localStorage.setItem("auth_token", "test-token");
      localStorage.setItem("auth_user", JSON.stringify({ id: "123" }));

      await logoutUser();

      expect(localStorage.removeItem).toHaveBeenCalledWith("auth_token");
      expect(localStorage.removeItem).toHaveBeenCalledWith("auth_user");
    });

    it("should call logout API endpoint if token exists", async () => {
      localStorage.setItem("auth_token", "test-token");
      (axios.post as jest.Mock).mockResolvedValueOnce({ data: { success: true } });

      await logoutUser();

      expect(axios.post).toHaveBeenCalledWith("/api/auth/logout");
      expect(localStorage.removeItem).toHaveBeenCalledWith("auth_token");
      expect(localStorage.removeItem).toHaveBeenCalledWith("auth_user");
    });
  });

  describe("registerUser", () => {
    const mockUserData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "patient",
    };

    const mockResponse = {
      data: {
        success: true,
        message: "User registered successfully",
        userId: "123",
      },
    };

    it("should successfully register a new user", async () => {
      (axios.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await registerUser(mockUserData);

      expect(axios.post).toHaveBeenCalledWith("/api/auth/register", mockUserData);
      expect(result).toEqual({
        success: true,
        message: "User registered successfully",
        userId: "123",
      });
    });

    it("should handle registration failure when email is taken", async () => {
      const errorResponse = {
        response: {
          data: {
            success: false,
            message: "Email already in use",
          },
          status: 400,
        },
      };

      (axios.post as jest.Mock).mockRejectedValueOnce(errorResponse);

      const result = await registerUser(mockUserData);

      expect(axios.post).toHaveBeenCalledWith("/api/auth/register", mockUserData);
      expect(result).toEqual({
        success: false,
        error: "Email already in use",
      });
    });

    it("should handle unexpected errors during registration", async () => {
      (axios.post as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const result = await registerUser(mockUserData);

      expect(axios.post).toHaveBeenCalledWith("/api/auth/register", mockUserData);
      expect(result).toEqual({
        success: false,
        error: "An error occurred during registration. Please try again.",
      });
    });
  });

  describe("validateToken", () => {
    const mockToken = "valid-jwt-token";
    const mockDecodedToken = {
      userId: "123",
      role: "doctor",
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    it("should return true for a valid token", () => {
      (jwt.verify as jest.Mock).mockReturnValueOnce(mockDecodedToken);

      const result = validateToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
      expect(result).toBe(true);
    });

    it("should return false for an expired token", () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error("jwt expired");
      });

      const result = validateToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
      expect(result).toBe(false);
    });

    it("should return false for an invalid token", () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error("invalid signature");
      });

      const result = validateToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
      expect(result).toBe(false);
    });

    it("should return false when token is null or undefined", () => {
      const result = validateToken(null as unknown as string);
      expect(result).toBe(false);

      const result2 = validateToken(undefined as unknown as string);
      expect(result2).toBe(false);

      expect(jwt.verify).not.toHaveBeenCalled();
    });
  });
});
