import React from "react";

const DoctorDashboard: React.FC = () => {
  return (
    <div data-testid="doctor-dashboard">
      <h1>Doctor Dashboard</h1>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Today's Appointments</h3>
          <p className="stat-value">8</p>
        </div>
        <div className="stat-card">
          <h3>Total Patients</h3>
          <p className="stat-value">126</p>
        </div>
        <div className="stat-card">
          <h3>Unread Messages</h3>
          <p className="stat-value">3</p>
        </div>
        <div className="stat-card">
          <h3>Pending Reports</h3>
          <p className="stat-value">5</p>
        </div>
      </div>

      <div className="upcoming-appointments">
        <h2>Upcoming Appointments</h2>
        <div className="appointment-list">
          <div className="appointment-item">
            <p className="time">9:00 AM</p>
            <p className="patient">John Doe</p>
            <p className="reason">Annual Checkup</p>
          </div>
          <div className="appointment-item">
            <p className="time">10:30 AM</p>
            <p className="patient">Jane Smith</p>
            <p className="reason">Follow-up Visit</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
