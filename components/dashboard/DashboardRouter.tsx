import React from "react";
import { useAuth } from "@/contexts/AuthContext";

// Import dashboard components
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import DoctorDashboard from "@/components/dashboard/DoctorDashboard";
import PatientDashboard from "@/components/dashboard/PatientDashboard";
import NurseDashboard from "@/components/dashboard/NurseDashboard";
import StaffDashboard from "@/components/dashboard/StaffDashboard";

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading user data...</div>;
  }

  // Return the appropriate dashboard based on user role
  switch (user.role) {
    case "admin":
      return <AdminDashboard />;

    case "doctor":
      return <DoctorDashboard />;

    case "patient":
      return <PatientDashboard />;

    case "nurse":
      return <NurseDashboard />;

    case "staff":
      return <StaffDashboard />;

    default:
      return <div>Invalid user role: {user.role}</div>;
  }
};

export default DashboardRouter;
