import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatDate } from "../../lib/formatDate";
import LoadingSpinner from "../LoadingSpinner";

interface Appointment {
  id: string;
  title: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  status: string;
  patient: {
    id: string;
    name: string;
    image?: string;
  };
  doctor: {
    id: string;
    name: string;
    department: string;
  };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  dueDate: Date;
  status: string;
  patient: {
    id: string;
    name: string;
  };
}

interface Schedule {
  id: string;
  name: string;
  role: string;
  department: string;
  shift: {
    start: Date;
    end: Date;
  };
}

export default function StaffDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    staffOnDuty: 0,
  });

  useEffect(() => {
    // This would normally fetch data from the API
    // For now, we're using mock data
    setTimeout(() => {
      const today = new Date();

      setAppointments([
        {
          id: "1",
          title: "Annual Physical",
          date: today,
          startTime: new Date(today.setHours(9, 0, 0, 0)),
          endTime: new Date(today.setHours(9, 30, 0, 0)),
          status: "CONFIRMED",
          patient: {
            id: "1",
            name: "Jane Doe",
            image: "https://randomuser.me/api/portraits/women/90.jpg",
          },
          doctor: {
            id: "1",
            name: "Dr. Smith",
            department: "Cardiology",
          },
        },
        // Add more appointments...
      ]);

      setInvoices([
        {
          id: "1",
          invoiceNumber: "INV-001",
          totalAmount: 150.0,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: "PENDING",
          patient: {
            id: "1",
            name: "Jane Doe",
          },
        },
        // Add more invoices...
      ]);

      setSchedules([
        {
          id: "1",
          name: "Dr. Smith",
          role: "Doctor",
          department: "Cardiology",
          shift: {
            start: new Date(today.setHours(8, 0, 0, 0)),
            end: new Date(today.setHours(16, 0, 0, 0)),
          },
        },
        // Add more schedules...
      ]);

      setStats({
        totalAppointments: 25,
        pendingPayments: 8,
        totalRevenue: 15750,
        staffOnDuty: 12,
      });

      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Staff Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Today's Appointments</p>
          <p className="text-3xl font-bold text-blue-600">{stats.totalAppointments}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Pending Payments</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingPayments}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600">${stats.totalRevenue}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Staff on Duty</p>
          <p className="text-3xl font-bold text-purple-600">{stats.staffOnDuty}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Today's Appointments</h2>
            <Link href="/appointments" className="text-blue-500 hover:text-blue-700 text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{appointment.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(appointment.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm text-gray-600">Patient: {appointment.patient.name}</p>
                    <p className="text-sm text-gray-600">Doctor: {appointment.doctor.name}</p>
                  </div>
                  <span
                    className={`px-2 py-1 h-fit text-xs rounded-full ${
                      appointment.status === "CONFIRMED"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Pending Invoices</h2>
            <Link href="/billing" className="text-blue-500 hover:text-blue-700 text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="border-l-4 border-yellow-500 pl-4 py-2">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Invoice #{invoice.invoiceNumber}</p>
                    <p className="text-sm text-gray-600">Patient: {invoice.patient.name}</p>
                    <p className="text-sm text-gray-600">Amount: ${invoice.totalAmount}</p>
                    <p className="text-sm text-gray-600">Due: {formatDate(invoice.dueDate)}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      {invoice.status}
                    </span>
                    <Link
                      href={`/billing/${invoice.id}/process`}
                      className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                    >
                      Process
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Schedule */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Staff Schedule</h2>
            <Link href="/schedule" className="text-blue-500 hover:text-blue-700 text-sm">
              Manage Schedule
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(schedule.shift.start).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -
                      {new Date(schedule.shift.end).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/schedule/${schedule.id}/edit`}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 flex flex-col items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Schedule Appointment</span>
            </button>
            <button className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 flex flex-col items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                />
              </svg>
              <span>Process Payment</span>
            </button>
            <button className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 flex flex-col items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span>Manage Staff</span>
            </button>
            <button className="bg-yellow-500 text-white p-4 rounded-lg hover:bg-yellow-600 flex flex-col items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Generate Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
