import React, { useContext, useEffect, useState } from "react";

// Define contexts
const AuthContext = React.createContext(null);
const ThemeContext = React.createContext(null);
const NotificationContext = React.createContext(null);

// Export context providers for use in the application
export const AuthProvider = ({
  children,
  initialValues = { authenticated: false, user: null },
}) => {
  const [auth, setAuth] = useState(initialValues);

  const login = (userData) => {
    setAuth({
      authenticated: true,
      user: userData,
    });
  };

  const logout = () => {
    setAuth({
      authenticated: false,
      user: null,
    });
  };

  return <AuthContext.Provider value={{ ...auth, login, logout }}>{children}</AuthContext.Provider>;
};

export const ThemeProvider = ({ children, initialTheme = "light" }) => {
  const [theme, setTheme] = useState(initialTheme);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, ...notification }]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hooks to use contexts
export const useAuth = () => useContext(AuthContext);
export const useTheme = () => useContext(ThemeContext);
export const useNotifications = () => useContext(NotificationContext);

// Component for displaying appointments
const AppointmentList = ({ appointments, onCancel }) => {
  const [confirmingId, setConfirmingId] = useState(null);

  const handleCancelClick = (appointmentId) => {
    setConfirmingId(appointmentId);
  };

  const handleConfirmCancel = (appointmentId) => {
    onCancel(appointmentId);
    setConfirmingId(null);
  };

  const handleCancelDialog = () => {
    setConfirmingId(null);
  };

  return (
    <div className="appointments-list">
      <h3>Your Appointments</h3>
      {appointments.length === 0 ? (
        <p>No appointments scheduled</p>
      ) : (
        appointments.map((appointment) => (
          <div key={appointment.id} className="appointment-card">
            <div className="appointment-details">
              <p>
                <strong>Date:</strong> {appointment.date}
              </p>
              <p>
                <strong>Doctor:</strong> {appointment.doctor}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`status-${appointment.status}`}>{appointment.status}</span>
              </p>
            </div>
            <button onClick={() => handleCancelClick(appointment.id)}>Cancel Appointment</button>

            {confirmingId === appointment.id && (
              <div className="confirm-dialog">
                <p>Are you sure you want to cancel this appointment?</p>
                <div className="dialog-actions">
                  <button onClick={() => handleConfirmCancel(appointment.id)}>Confirm</button>
                  <button onClick={handleCancelDialog}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

// Admin controls component - only shown for admin users
const AdminControls = () => {
  return (
    <div data-testid="admin-controls" className="admin-controls">
      <h3>Admin Controls</h3>
      <button>Manage Users</button>
      <button>View System Logs</button>
      <button>Edit Schedule</button>
    </div>
  );
};

// Notifications component
const Notifications = ({ notifications }) => {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="notifications-container">
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      ))}
    </div>
  );
};

// Main ProfileDashboard component
const ProfileDashboard = () => {
  const { authenticated, user, login } = useAuth();
  const { theme } = useTheme();
  const { notifications, addNotification } = useNotifications();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch user data when component mounts and user is authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (!authenticated || !user) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/user/${user.id}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch user data");
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authenticated, user]);

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId) => {
    try {
      const response = await fetch(`/api/appointments/cancel/${appointmentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel appointment");
      }

      // Update user data to reflect cancelled appointment
      setUserData((prevData) => ({
        ...prevData,
        appointments: prevData.appointments.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: "cancelled" } : apt,
        ),
      }));

      setSuccessMessage("Appointment cancelled successfully");
      addNotification({
        type: "success",
        message: "Appointment cancelled successfully",
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(err.message);
      addNotification({
        type: "error",
        message: err.message,
      });
    }
  };

  // Handle retry when fetch fails
  const handleRetry = () => {
    setError(null);
    // Re-trigger the effect by updating a dependency
    if (user) {
      const updatedUser = { ...user, retry: Date.now() };
      login(updatedUser);
    }
  };

  // If user is not authenticated, show login prompt
  if (!authenticated) {
    return (
      <div className="login-prompt">
        <p>Please login to view your profile</p>
        <button onClick={() => login({ id: "123", name: "John Doe" })}>Login</button>
      </div>
    );
  }

  return (
    <div data-testid="dashboard-container" className={`dashboard-container ${theme}-theme`}>
      <Notifications notifications={notifications} />

      {successMessage && <div className="success-message">{successMessage}</div>}

      {error ? (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={handleRetry}>Retry</button>
        </div>
      ) : loading ? (
        <div data-testid="loading-spinner" className="loading-spinner">
          Loading...
        </div>
      ) : userData ? (
        <div className="profile-content">
          <div className="user-info">
            <h2>{userData.name}</h2>
            <p>{userData.email}</p>
          </div>

          <AppointmentList
            appointments={userData.appointments}
            onCancel={handleCancelAppointment}
          />

          {/* Show admin controls only for admin users */}
          {user?.role === "admin" && <AdminControls />}
        </div>
      ) : null}
    </div>
  );
};

export default ProfileDashboard;
