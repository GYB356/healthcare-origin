import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.js";
import axios from "axios";
import { format } from "date-fns";
import {
  CalendarIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CreditCardIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  ExclamationCircleIcon,
  BellIcon,
  HeartIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  BeakerIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

// Dashboard card component
const DashboardCard = ({ title, icon, count, linkTo, linkText, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-700">{title}</h3>
            <p className="text-3xl font-bold mt-2">{count}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>{icon}</div>
        </div>
        <Link
          to={linkTo}
          className="block mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          {linkText} →
        </Link>
      </div>
    </div>
  );
};

// Health metric component
const HealthMetric = ({ title, value, icon, trend, info }) => {
  const trendColor = trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-500";
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-500 text-sm font-medium">{title}</span>
        {icon}
      </div>
      <div className="flex items-baseline">
        <span className="text-2xl font-bold mr-2">{value}</span>
        {trend && (
          <span className={`flex items-center ${trendColor}`}>
            <ArrowTrendingUpIcon className={`h-4 w-4 ${trend === "down" ? "transform rotate-180" : ""}`} />
            <span className="text-xs ml-1">{info}</span>
          </span>
        )}
      </div>
    </div>
  );
};

// Notification component
const Notification = ({ type, message, time }) => {
  const typeColors = {
    appointment: "border-blue-500 bg-blue-50",
    medication: "border-purple-500 bg-purple-50",
    message: "border-green-500 bg-green-50",
    alert: "border-red-500 bg-red-50"
  };
  
  return (
    <div className={`border-l-4 p-4 mb-3 ${typeColors[type]}`}>
      <div className="flex justify-between">
        <p className="font-medium">{message}</p>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
    </div>
  );
};

const PatientDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    upcomingAppointments: [],
    recentMedicalRecords: [],
    pendingBills: [],
    unreadMessages: 0,
    medications: [],
    labResults: [],
    vitalSigns: {}
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Check for mock data in localStorage first (for development)
        const mockDataStr = localStorage.getItem("mockDashboardData");

        if (mockDataStr) {
          // If mock data exists, use it
          const mockData = JSON.parse(mockDataStr);
          setDashboardData(mockData);
          setLoading(false);
          return;
        }

        // If no mock data, make the real API call
        const patientResponse = await axios.get("/api/patients/dashboard", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setDashboardData(patientResponse.data);
        
        // Fetch notifications
        const notificationsResponse = await axios.get("/api/notifications", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        setNotifications(notificationsResponse.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  const renderTabContent = () => {
    switch(activeTab) {
      case "appointments":
        return (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800">My Appointments</h2>
              <Link 
                to="/appointments/new" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                New Appointment
              </Link>
            </div>
            <div className="p-6">
              {dashboardData.upcomingAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {dashboardData.upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {appointment.appointmentType} with Dr. {appointment.doctorId?.fullName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(appointment.scheduledDate), "MMMM d, yyyy")} at{" "}
                          {format(new Date(appointment.scheduledDate), "h:mm a")}
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0 flex space-x-2">
                        <Link
                          to={`/appointments/${appointment._id}`}
                          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                        >
                          Details
                        </Link>
                        <Link
                          to={`/appointments/${appointment._id}/reschedule`}
                          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100"
                        >
                          Reschedule
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      
      case "records":
        return (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800">Medical Records</h2>
              <Link 
                to="/medical-records/request" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Request Update
              </Link>
            </div>
            <div className="p-6">
              {dashboardData.recentMedicalRecords.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent medical records</p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {dashboardData.recentMedicalRecords.map((record) => (
                    <div key={record._id} className="py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">{record.recordType}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(record.recordDate), "MMMM d, yyyy")} • Dr.{" "}
                            {record.provider?.fullName}
                          </p>
                        </div>
                        <Link
                          to={`/medical-records/${record._id}`}
                          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        
      case "messages":
        return (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Messages</h2>
            </div>
            <div className="p-6">
              <div className="divide-y divide-gray-200">
                {dashboardData.messages && dashboardData.messages.length > 0 ? (
                  dashboardData.messages.map((message) => (
                    <div key={message._id} className="py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">From: Dr. {message.from}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(message.date), "MMMM d, yyyy")} at {format(new Date(message.date), "h:mm a")}
                          </p>
                          <p className="mt-2 text-gray-700">{message.preview}...</p>
                        </div>
                        <Link
                          to={`/messages/${message._id}`}
                          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                        >
                          Read
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No messages</p>
                )}
              </div>
              
              <div className="mt-6">
                <Link
                  to="/messages/new"
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  New Message
                </Link>
              </div>
            </div>
          </div>
        );
      
      case "billing":
        return (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Billing & Insurance</h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-gray-700 font-medium mb-3">Insurance Information</h3>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Provider</p>
                      <p className="font-medium">Blue Cross Blue Shield</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Member ID</p>
                      <p className="font-medium">BCBS123456789</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Group Number</p>
                      <p className="font-medium">GRP987654321</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Coverage</p>
                      <p className="font-medium">Family Plan</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-gray-700 font-medium mb-3">Recent Bills</h3>
              {dashboardData.pendingBills && dashboardData.pendingBills.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.pendingBills.map((bill) => (
                    <div key={bill._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">{bill.description}</p>
                          <p className="text-sm text-gray-500">
                            Date: {format(new Date(bill.date), "MMMM d, yyyy")}
                          </p>
                          <div className="mt-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              bill.status === "paid" 
                                ? "bg-green-100 text-green-800" 
                                : bill.status === "processing" 
                                ? "bg-yellow-100 text-yellow-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">${bill.amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">
                            Insurance: ${bill.insuranceCoverage.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Your Responsibility: ${(bill.amount - bill.insuranceCoverage).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {bill.status !== "paid" && (
                        <div className="mt-4">
                          <Link
                            to={`/billing/${bill._id}/pay`}
                            className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Pay Now
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No bills to display</p>
              )}
            </div>
          </div>
        );
      
      default: // "overview"
        return (
          <>
            {/* Health status summary */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-800">Health Status</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <HealthMetric 
                    title="Blood Pressure" 
                    value="120/80" 
                    icon={<HeartIcon className="h-5 w-5 text-red-500" />} 
                    trend="stable"
                    info="Normal" 
                  />
                  <HealthMetric 
                    title="Heart Rate" 
                    value="72 bpm" 
                    icon={<HeartIcon className="h-5 w-5 text-red-500" />} 
                    trend="down"
                    info="-3 from last check" 
                  />
                  <HealthMetric 
                    title="Weight" 
                    value="160 lbs" 
                    icon={<ChartBarIcon className="h-5 w-5 text-blue-500" />} 
                    trend="up"
                    info="+2 lbs this month" 
                  />
                  <HealthMetric 
                    title="Blood Glucose" 
                    value="95 mg/dL" 
                    icon={<BeakerIcon className="h-5 w-5 text-purple-500" />} 
                    trend="stable"
                    info="Normal" 
                  />
                </div>
                
                <div className="flex justify-center">
                  <Link
                    to="/health-tracker"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    View Health Tracker
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <DashboardCard
                title="Appointments"
                icon={<CalendarIcon className="h-6 w-6 text-white" />}
                count={dashboardData.upcomingAppointments.length}
                linkTo="/appointments"
                linkText="View all appointments"
                color="bg-blue-500"
              />

              <DashboardCard
                title="Medical Records"
                icon={<ClipboardDocumentListIcon className="h-6 w-6 text-white" />}
                count={dashboardData.recentMedicalRecords.length}
                linkTo="/medical-records"
                linkText="View all records"
                color="bg-green-500"
              />

              <DashboardCard
                title="Pending Bills"
                icon={<CreditCardIcon className="h-6 w-6 text-white" />}
                count={dashboardData.pendingBills.length}
                linkTo="/billing"
                linkText="View all bills"
                color="bg-yellow-500"
              />

              <DashboardCard
                title="Messages"
                icon={<ChatBubbleLeftIcon className="h-6 w-6 text-white" />}
                count={dashboardData.unreadMessages}
                linkTo="/messages"
                linkText="View all messages"
                color="bg-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upcoming appointments */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-800">Upcoming Appointments</h2>
                </div>

                <div className="p-6">
                  {dashboardData.upcomingAppointments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {dashboardData.upcomingAppointments.slice(0, 3).map((appointment) => (
                        <div
                          key={appointment._id}
                          className="py-4 flex flex-col sm:flex-row sm:items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {appointment.appointmentType} with Dr. {appointment.doctorId?.fullName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(appointment.scheduledDate), "MMMM d, yyyy")} at{" "}
                              {format(new Date(appointment.scheduledDate), "h:mm a")}
                            </p>
                          </div>
                          <Link
                            to={`/appointments/${appointment._id}`}
                            className="mt-2 sm:mt-0 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                          >
                            Details
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 text-center">
                    <Link
                      to="/appointments"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View All Appointments
                    </Link>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-800">Notifications</h2>
                </div>

                <div className="p-6">
                  {notifications.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No notifications</p>
                  ) : (
                    <div>
                      {notifications.slice(0, 5).map((notification, idx) => (
                        <Notification
                          key={idx}
                          type={notification.type}
                          message={notification.message}
                          time={notification.time}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {currentUser?.fullName}</h1>
        <p className="text-gray-600 mt-1">Here's your health at a glance</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-md font-medium mr-2 whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("appointments")}
          className={`px-4 py-2 rounded-md font-medium mr-2 whitespace-nowrap ${
            activeTab === "appointments"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          Appointments
        </button>
        <button
          onClick={() => setActiveTab("records")}
          className={`px-4 py-2 rounded-md font-medium mr-2 whitespace-nowrap ${
            activeTab === "records"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          Medical Records
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`px-4 py-2 rounded-md font-medium mr-2 whitespace-nowrap ${
            activeTab === "messages"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          Messages
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`px-4 py-2 rounded-md font-medium mr-2 whitespace-nowrap ${
            activeTab === "billing"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          Billing
        </button>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default PatientDashboard;
