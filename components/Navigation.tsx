import React from "react";
import { useAuth } from "@/contexts/AuthContext";

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navigation">
      <div className="logo">
        <span>Healthcare Portal</span>
      </div>

      <div className="nav-links">
        <a href="/dashboard">Dashboard</a>
        <a href="/appointments">Appointments</a>
        <a href="/messages">Messages</a>
        {user?.role === "admin" && <a href="/admin">Admin</a>}
      </div>

      <div className="user-menu">
        <span>{user?.username}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navigation;
