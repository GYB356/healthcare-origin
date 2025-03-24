import React from "react";

const PatientDashboard: React.FC = () => {
  return (
    <div data-testid="patient-dashboard">
      <h1>Patient Dashboard</h1>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Upcoming Appointments</h3>
          <p className="stat-value">2</p>
        </div>
        <div className="stat-card">
          <h3>Prescriptions</h3>
          <p className="stat-value">3</p>
        </div>
        <div className="stat-card">
          <h3>Unread Messages</h3>
          <p className="stat-value">1</p>
        </div>
        <div className="stat-card">
          <h3>Medical Records</h3>
          <p className="stat-value">12</p>
        </div>
      </div>

      <div className="next-appointment">
        <h2>Next Appointment</h2>
        <div className="appointment-details">
          <p className="date-time">May 15, 2025 - 10:00 AM</p>
          <p className="doctor">Dr. Sarah Johnson</p>
          <p className="location">Main Clinic, Room 305</p>
          <div className="appointment-actions">
            <button className="reschedule-btn">Reschedule</button>
            <button className="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>

      <div className="recent-messages">
        <h2>Recent Messages</h2>
        <div className="message-list">
          <div className="message-item">
            <p className="sender">Dr. Sarah Johnson</p>
            <p className="preview">Your lab results look good. No need for concern...</p>
            <p className="time">Yesterday</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
