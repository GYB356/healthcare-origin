import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean }>;
  logout: () => void;
  register: (userData: any) => Promise<{ success: boolean }>;
  loading: boolean;
  error: string | null;
  token: string | null;
}

const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  login: async () => ({ success: false }),
  logout: () => {},
  register: async () => ({ success: false }),
  loading: false,
  error: null,
  token: null,
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);
AuthContext.displayName = "AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<
    Omit<AuthContextType, "login" | "logout" | "register">
  >({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
    token: null,
  });

  useEffect(() => {
    // Check for stored auth token on initial load
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      setAuthState({
        isAuthenticated: true,
        user: JSON.parse(storedUser),
        loading: false,
        error: null,
        token: storedToken,
      });
    } else {
      setAuthState((prevState) => ({ ...prevState, loading: false }));
    }
  }, []);

  const login = async (credentials: {
    email: string;
    password: string;
  }): Promise<{ success: boolean }> => {
    try {
      // Simulate API call
      const response = {
        success: true,
        token: "mock-token",
        user: { id: "123", username: "testuser", email: credentials.email, role: "admin" },
      };

      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("auth_user", JSON.stringify(response.user));

      setAuthState({
        isAuthenticated: true,
        user: response.user,
        loading: false,
        error: null,
        token: response.token,
      });

      return { success: true };
    } catch (error) {
      setAuthState((prevState) => ({
        ...prevState,
        error: "Login failed",
        loading: false,
      }));
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");

    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
      token: null,
    });
  };

  const register = async (userData: any): Promise<{ success: boolean }> => {
    try {
      // Simulate API call
      const response = { success: true };
      return response;
    } catch (error) {
      setAuthState((prevState) => ({
        ...prevState,
        error: "Registration failed",
        loading: false,
      }));
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default useAuth;
