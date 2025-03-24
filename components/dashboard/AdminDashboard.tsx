import React from "react";

const AdminDashboard: React.FC = () => {
  return (
    <div data-testid="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">245</p>
        </div>
        <div className="stat-card">
          <h3>Active Doctors</h3>
          <p className="stat-value">42</p>
        </div>
        <div className="stat-card">
          <h3>Active Patients</h3>
          <p className="stat-value">178</p>
        </div>
        <div className="stat-card">
          <h3>Appointments Today</h3>
          <p className="stat-value">37</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <button>Manage Users</button>
        <button>System Settings</button>
        <button>View Reports</button>
      </div>
    </div>
  );
};

export default AdminDashboard;
