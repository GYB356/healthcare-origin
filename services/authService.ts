/**
 * Authentication Service
 */
import axios from "axios";
import jwt from "jsonwebtoken";
import { User } from "@/types/User";

// JWT Secret (would normally be in an env variable)
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

/**
 * Login user with credentials
 */
export const loginUser = async (credentials: {
  email: string;
  password: string;
}): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> => {
  try {
    const response = await axios.post("/api/auth/login", credentials);

    if (response.data.success) {
      // Store token and user data
      localStorage.setItem("auth_token", response.data.token);
      localStorage.setItem("auth_user", JSON.stringify(response.data.user));

      return {
        success: true,
        user: response.data.user,
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Login failed",
      };
    }
  } catch (error: any) {
    // Handle error response from API
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || "Login failed",
      };
    }

    // Generic error handling
    return {
      success: false,
      error: "An error occurred during login. Please try again.",
    };
  }
};

/**
 * Logout user and clear stored data
 */
export const logoutUser = async (): Promise<void> => {
  const token = localStorage.getItem("auth_token");

  // Call logout API if token exists
  if (token) {
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    }
  }

  // Always clear local storage
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
};

/**
 * Register a new user
 */
export const registerUser = async (
  userData: any,
): Promise<{
  success: boolean;
  userId?: string;
  message?: string;
  error?: string;
}> => {
  try {
    const response = await axios.post("/api/auth/register", userData);

    if (response.data.success) {
      return {
        success: true,
        userId: response.data.userId,
        message: response.data.message,
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Registration failed",
      };
    }
  } catch (error: any) {
    // Handle error response from API
    if (error.response && error.response.data) {
      return {
        success: false,
        error: error.response.data.message || "Registration failed",
      };
    }

    // Generic error handling
    return {
      success: false,
      error: "An error occurred during registration. Please try again.",
    };
  }
};

/**
 * Validate JWT token
 */
export const validateToken = (token: string): boolean => {
  if (!token) {
    return false;
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get current user from storage
 */
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem("auth_user");
  if (!userJson) {
    return null;
  }

  try {
    return JSON.parse(userJson);
  } catch (error) {
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("auth_token");
  return !!token && validateToken(token);
};

export default {
  loginUser,
  logoutUser,
  registerUser,
  validateToken,
  getCurrentUser,
  isAuthenticated,
};
