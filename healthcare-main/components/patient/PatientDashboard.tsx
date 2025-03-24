import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  CalendarIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

interface DashboardStats {
  upcomingAppointments: number;
  activePrescriptions: number;
  recentLabResults: number;
  medicalHistory: number;
}

export default function PatientDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    activePrescriptions: 0,
    recentLabResults: 0,
    medicalHistory: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/patient/dashboard");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    if (session?.user) {
      fetchDashboardData();
    }
  }, [session]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome back, {session?.user?.name}</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-blue-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.upcomingAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ClipboardDocumentListIcon className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Active Prescriptions</h3>
              <p className="text-3xl font-bold text-green-600">{stats.activePrescriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-purple-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Lab Results</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.recentLabResults}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 text-orange-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Medical History</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.medicalHistory}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button className="bg-blue-500 text-white rounded-lg p-4 hover:bg-blue-600 transition-colors">
          Schedule Appointment
        </button>
        <button className="bg-green-500 text-white rounded-lg p-4 hover:bg-green-600 transition-colors">
          View Prescriptions
        </button>
        <button className="bg-purple-500 text-white rounded-lg p-4 hover:bg-purple-600 transition-colors">
          Check Lab Results
        </button>
        <button className="bg-orange-500 text-white rounded-lg p-4 hover:bg-orange-600 transition-colors">
          Medical History
        </button>
        <button className="bg-indigo-500 text-white rounded-lg p-4 hover:bg-indigo-600 transition-colors">
          Message Doctor
        </button>
        <button className="bg-pink-500 text-white rounded-lg p-4 hover:bg-pink-600 transition-colors">
          Emergency Contact
        </button>
      </div>
    </div>
  );
}
