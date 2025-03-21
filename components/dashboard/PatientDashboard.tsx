import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatDate } from '../../lib/formatDate';
import LoadingSpinner from '../LoadingSpinner';

interface Appointment {
  id: string;
  title: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  status: string;
  isVirtual: boolean;
  virtualLink?: string;
  doctor: {
    id: string;
    name: string;
    specialty: string;
  };
}

interface MedicalRecord {
  id: string;
  title: string;
  date: Date;
  doctor: {
    name: string;
    specialty: string;
  };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  dueDate: Date;
  status: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
  read: boolean;
  sender: {
    name: string;
  };
}

export default function PatientDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentMedicalRecords, setRecentMedicalRecords] = useState<MedicalRecord[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);
  const [vitals, setVitals] = useState<{
    bloodPressure: string;
    heartRate: string;
    weight: string;
    temperature: string;
  }>({
    bloodPressure: '120/80',
    heartRate: '72 bpm',
    weight: '165 lbs',
    temperature: '98.6°F',
  });

  useEffect(() => {
    // This would normally fetch data from the API
    // For now, we're using mock data
    setTimeout(() => {
      setUpcomingAppointments([
        {
          id: '1',
          title: 'Annual Physical',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // 10am
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), // 11am
          status: 'CONFIRMED',
          isVirtual: false,
          doctor: {
            id: '1',
            name: 'Dr. Smith',
            specialty: 'General Medicine',
          },
        },
        {
          id: '2',
          title: 'Cardiology Consultation',
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // 2pm
          endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000), // 3pm
          status: 'SCHEDULED',
          isVirtual: true,
          virtualLink: 'https://meet.example.com/dr-johnson-123',
          doctor: {
            id: '2',
            name: 'Dr. Johnson',
            specialty: 'Cardiology',
          },
        },
      ]);

      setRecentMedicalRecords([
        {
          id: '1',
          title: 'Annual Physical Results',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          doctor: {
            name: 'Dr. Smith',
            specialty: 'General Medicine',
          },
        },
        {
          id: '2',
          title: 'Blood Test Results',
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          doctor: {
            name: 'Dr. Johnson',
            specialty: 'Cardiology',
          },
        },
      ]);

      setPendingInvoices([
        {
          id: '1',
          invoiceNumber: 'INV-001',
          totalAmount: 150.00,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
          status: 'PENDING',
        },
        {
          id: '2',
          invoiceNumber: 'INV-002',
          totalAmount: 75.50,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          status: 'PENDING',
        },
      ]);

      setUnreadMessages([
        {
          id: '1',
          senderId: '1',
          content: 'Your test results are ready. Please schedule a follow-up appointment.',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: false,
          sender: {
            name: 'Dr. Smith',
          },
        },
        {
          id: '2',
          senderId: '2',
          content: 'Just following up on your recent medication. Have you noticed any side effects?',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          read: false,
          sender: {
            name: 'Dr. Johnson',
          },
        },
      ]);

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
      <h1 className="text-2xl font-bold mb-6">Welcome, {session?.user?.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
            <Link href="/appointments" className="text-blue-500 hover:text-blue-700 text-sm">
              View All
            </Link>
          </div>
          {upcomingAppointments.length === 0 ? (
            <p className="text-gray-500">No upcoming appointments</p>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="font-medium">{appointment.title}</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(appointment.date)} • {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm text-gray-600">With: {appointment.doctor.name}</p>
                  <div className="mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                    {appointment.isVirtual && (
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        Virtual
                      </span>
                    )}
                  </div>
                  {appointment.isVirtual && appointment.virtualLink && (
                    <a 
                      href={appointment.virtualLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm text-blue-500 hover:text-blue-700"
                    >
                      Join Virtual Appointment
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Medical Records */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Medical Records</h2>
            <Link href="/medical-records" className="text-blue-500 hover:text-blue-700 text-sm">
              View All
            </Link>
          </div>
          {recentMedicalRecords.length === 0 ? (
            <p className="text-gray-500">No recent medical records</p>
          ) : (
            <div className="space-y-4">
              {recentMedicalRecords.map((record) => (
                <div key={record.id} className="border-l-4 border-green-500 pl-4 py-2">
                  <p className="font-medium">{record.title}</p>
                  <p className="text-sm text-gray-600">{formatDate(record.date)}</p>
                  <p className="text-sm text-gray-600">By: {record.doctor.name}</p>
                  <Link href={`/medical-records/${record.id}`} className="mt-1 inline-block text-sm text-blue-500 hover:text-blue-700">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Billing & Payments */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Billing & Payments</h2>
            <Link href="/billing" className="text-blue-500 hover:text-blue-700 text-sm">
              View All
            </Link>
          </div>
          {pendingInvoices.length === 0 ? (
            <p className="text-gray-500">No pending invoices</p>
          ) : (
            <div className="space-y-4">
              {pendingInvoices.map((invoice) => (
                <div key={invoice.id} className="border-l-4 border-yellow-500 pl-4 py-2">
                  <p className="font-medium">Invoice #{invoice.invoiceNumber}</p>
                  <p className="text-sm text-gray-600">
                    Amount: ${invoice.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Due Date: {formatDate(invoice.dueDate)}
                  </p>
                  <Link href={`/billing/${invoice.id}/pay`} className="mt-1 inline-block text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
                    Pay Now
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Link href="/messages" className="text-blue-500 hover:text-blue-700 text-sm">
              View All
            </Link>
          </div>
          {unreadMessages.length === 0 ? (
            <p className="text-gray-500">No unread messages</p>
          ) : (
            <div className="space-y-4">
              {unreadMessages.map((message) => (
                <div key={message.id} className="border-l-4 border-purple-500 pl-4 py-2">
                  <p className="font-medium">From: {message.sender.name}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm text-gray-800 line-clamp-2">{message.content}</p>
                  <Link href={`/messages#${message.senderId}`} className="mt-1 inline-block text-sm text-blue-500 hover:text-blue-700">
                    Reply
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Health Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Your Health</h2>
            <Link href="/health-tracker" className="text-blue-500 hover:text-blue-700 text-sm">
              Health Tracker
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Blood Pressure</p>
              <p className="text-xl font-bold text-blue-700">{vitals.bloodPressure}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Heart Rate</p>
              <p className="text-xl font-bold text-green-700">{vitals.heartRate}</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Weight</p>
              <p className="text-xl font-bold text-yellow-700">{vitals.weight}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Temperature</p>
              <p className="text-xl font-bold text-red-700">{vitals.temperature}</p>
            </div>
          </div>
          <div className="mt-4">
            <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
              Record New Measurement
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
              Schedule Appointment
            </button>
            <button className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600">
              Request Prescription Refill
            </button>
            <button className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600">
              Upload Medical Document
            </button>
            <button className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 