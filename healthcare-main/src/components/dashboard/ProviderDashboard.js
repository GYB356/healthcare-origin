import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.js";
import providerService from "../../services/ProviderService.js";
import {
  Calendar,
  FileText,
  MessageSquare,
  CreditCard,
  Activity,
  Users,
  User,
  Menu,
  X,
  Bell,
  ChevronDown,
  ChevronRight,
  Shield,
  Sun,
  Moon,
  LogOut,
  Settings,
  HelpCircle,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// Function to determine notification color based on type
const getNotificationColor = (type) => {
  switch (type) {
    case "urgent":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
    case "warning":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
    case "success":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    case "appointment":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
    case "message":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
    case "info":
    default:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
  }
};

// Function to determine notification icon based on type
const getNotificationIcon = (type) => {
  switch (type) {
    case "urgent":
      return <AlertTriangle size={16} />;
    case "warning":
      return <AlertCircle size={16} />;
    case "success":
      return <CheckCircle size={16} />;
    case "appointment":
      return <Calendar size={16} />;
    case "message":
      return <MessageSquare size={16} />;
    case "info":
    default:
      return <Bell size={16} />;
  }
};

const ProviderDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await providerService.getProjects();
        setProjects(response.data || []);
      } catch (err) {
        setError("Failed to load projects: " + (err.response?.data?.message || err.message));
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Handle loading state with a better UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Handle error state with a better UI
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Provider Dashboard</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No projects found.</p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => navigate("/projects/new")}
            >
              Create New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project._id || project.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium">{project.name}</h3>
                <p className="text-gray-600">{project.address}</p>
                <p className="text-sm mt-2">Status: {project.status}</p>
                <button
                  className="mt-3 text-blue-500 hover:text-blue-700 text-sm font-medium"
                  onClick={() => navigate(`/projects/${project._id || project.id}`)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;

        
        // In a real app, these would be separate API calls
        // For simplicity, we're using one service method
        const response = await providerService.getDashboardData();
        
        setPatients(response.patients || []);
        setTasks(response.tasks || []);
        setAppointments(response.appointments || []);
        setUnreadMessages(response.unreadMessages || 0);
      } catch (err) {
        setError("Failed to load data: " + (err.response?.data?.message || err.message));
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCompleteTask = (taskId) => {
    // In a real app, you would call an API to update the task status
    setTasks(tasks.filter(task => task._id !== taskId));
  };
  
  const filteredPatients = patients.filter(patient => 
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle loading state with a better UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Handle error state with a better UI
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  const renderTabContent = () => {
    switch(activeTab) {
      case "patients":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 mb-4">No patients found matching your search criteria.</p>
              </div>
            ) : (
              filteredPatients.map(patient => (
                <PatientCard
                  key={patient._id}
                  patient={patient}
                  lastVisit={patient.lastVisit}
                  upcomingAppointment={patient.upcomingAppointment}
                  status={patient.status}
                />
              ))
            )}
          </div>
        );
        
      case "tasks":
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Tasks & Follow-ups</h3>
              <Link 
                to="/tasks/new" 
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Plus size={16} className="mr-1" /> 
                New Task
              </Link>
            </div>
            
            <div className="flex space-x-3 mb-4">
              <button className="px-3 py-1 text-sm border border-blue-500 text-blue-600 rounded-full bg-blue-50">
                All Tasks
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50">
                High Priority
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50">
                Due Today
              </button>
            </div>
            
            {tasks.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 mb-4">No tasks found.</p>
                <Link 
                  to="/tasks/new" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create New Task
                </Link>
              </div>
            ) : (
              <div>
                {tasks.map(task => (
                  <Task 
                    key={task._id} 
                    task={task} 
                    onComplete={handleCompleteTask} 
                  />
                ))}
              </div>
            )}
          </div>
        );
        
      case "appointments":
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Today's Schedule</h3>
              <Link 
                to="/appointments/new" 
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Plus size={16} className="mr-1" /> 
                New Appointment
              </Link>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                <p className="text-sm text-gray-600">Appointments</p>
                <p className="text-2xl font-bold text-blue-600">{appointments.length}</p>
                <p className="text-xs text-gray-500">Today</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {appointments.filter(a => a.status === 'completed').length}
                </p>
                <p className="text-xs text-gray-500">Today</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-center">
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {appointments.filter(a => a.status === 'upcoming').length}
                </p>
                <p className="text-xs text-gray-500">Today</p>
              </div>
            </div>
            
            {appointments.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 mb-4">No appointments scheduled for today.</p>
                <Link 
                  to="/appointments/new" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Schedule Appointment
                </Link>
              </div>
            ) : (
              <div>
                {appointments.map(appointment => (
                  <Appointment key={appointment._id} appointment={appointment} />
                ))}
              </div>
            )}
          </div>
        );
        
      case "messages":
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Messages</h3>
              <Link 
                to="/messages/new" 
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Plus size={16} className="mr-1" /> 
                New Message
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="text-center py-8">
                <MessageSquare size={40} className="mx-auto text-blue-500 mb-2" />
                <p className="text-gray-500 mb-4">Access your messages center for secure communication.</p>
                <Link 
                  to="/messages" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Go to Messages
                </Link>
              </div>
            </div>
          </div>
        );
        
      case "documents":
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Medical Documents</h3>
              <Link 
                to="/documents/upload" 
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Plus size={16} className="mr-1" /> 
                Upload Document
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-center py-8">
                <FileText size={40} className="mx-auto text-blue-500 mb-2" />
                <p className="text-gray-500 mb-4">Access all patient documents and medical records.</p>
                <Link 
                  to="/documents" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Go to Documents
                </Link>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="text-gray-600">Welcome back, Dr. {currentUser?.lastName}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="relative p-2 rounded-full bg-white shadow-sm hover:bg-gray-50">
            <Bell size={20} />
            {unreadMessages > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </button>
          <button className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50">
            <Clock size={20} />
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
            <Users size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Patients</p>
            <p className="text-2xl font-bold">{patients.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
            <Calendar size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Appointments</p>
            <p className="text-2xl font-bold">{appointments.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
            <CheckCircle size={24} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tasks</p>
            <p className="text-2xl font-bold">{tasks.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
            <MessageSquare size={24} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Unread Messages</p>
            <p className="text-2xl font-bold">{unreadMessages}</p>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="mb-6 flex overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("patients")}
          className={`px-4 py-2 rounded-md font-medium mr-2 whitespace-nowrap ${
            activeTab === "patients"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <span className="flex items-center">
            <User size={16} className="mr-1" /> Patients
          </span>
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`px-4 py-2 rounded-md font-medium mr-2 whitespace-nowrap ${
            activeTab === "tasks"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <span className="flex items-center">
            <CheckCircle size={16} className="mr-1" /> Tasks
          </span>
        </button>
        <button
          onClick={() => setActiveTab("appointments")}
          className={`px-4 py-2 rounded-md font-medium mr-2 whitespace-nowrap ${
            activeTab === "appointments"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <span className="flex items-center">
            <Calendar size={16} className="mr-1" /> Appointments
          </span>
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`px-4 py-2 rounded-md font-medium mr-2 whitespace-nowrap ${
            activeTab === "messages"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <span className="flex items-center">
            <MessageSquare size={16} className="mr-1" /> Messages
          </span>
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`px-4 py-2 rounded-md font-medium mr-2 whitespace-nowrap ${
            activeTab === "documents"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <span className="flex items-center">
            <FileText size={16} className="mr-1" /> Documents
          </span>
        </button>
      </div>
      
      {/* Search & Filter (only for patients tab) */}
      {activeTab === "patients" && (
        <div className="mb-6 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
          </div>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50 flex items-center">
            <Filter size={16} className="mr-1" /> Filters
          </button>
        </div>
      )}
      
      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProviderDashboard;