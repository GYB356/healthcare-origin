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
  patient: {
    id: string;
    name: string;
    image?: string;
  };
}

interface Patient {
  id: string;
  name: string;
  image?: string;
  age: number;
  lastVisit: Date;
  upcomingAppointment?: {
    date: Date;
    time: string;
  };
}

interface MedicalRecord {
  id: string;
  patientName: string;
  title: string;
  date: Date;
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
    image?: string;
  };
}

export default function DoctorDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [pendingRecords, setPendingRecords] = useState<MedicalRecord[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState({
    totalAppointmentsToday: 0,
    patientsSeenThisWeek: 0,
    upcomingAppointments: 0,
    averageConsultationTime: 0,
  });

  useEffect(() => {
    // This would normally fetch data from the API
    // For now, we're using mock data
    setTimeout(() => {
      const today = new Date();

      setTodayAppointments([
        {
          id: '1',
          title: 'Annual Physical',
          date: today,
          startTime: new Date(today.setHours(9, 0, 0, 0)),
          endTime: new Date(today.setHours(9, 30, 0, 0)),
          status: 'CONFIRMED',
          isVirtual: false,
          patient: {
            id: '1',
            name: 'Jane Doe',
            image: 'https://randomuser.me/api/portraits/women/90.jpg',
          },
        },
        {
          id: '2',
          title: 'Follow-up Consultation',
          date: today,
          startTime: new Date(today.setHours(11, 0, 0, 0)),
          endTime: new Date(today.setHours(11, 30, 0, 0)),
          status: 'SCHEDULED',
          isVirtual: true,
          virtualLink: 'https://meet.example.com/dr-smith-123',
          patient: {
            id: '2',
            name: 'John Smith',
            image: 'https://randomuser.me/api/portraits/men/32.jpg',
          },
        },
        {
          id: '3',
          title: 'New Patient Intake',
          date: today,
          startTime: new Date(today.setHours(14, 0, 0, 0)),
          endTime: new Date(today.setHours(15, 0, 0, 0)),
          status: 'CONFIRMED',
          isVirtual: false,
          patient: {
            id: '3',
            name: 'Michael Johnson',
            image: 'https://randomuser.me/api/portraits/men/45.jpg',
          },
        },
      ]);

      setRecentPatients([
        {
          id: '1',
          name: 'Jane Doe',
          image: 'https://randomuser.me/api/portraits/women/90.jpg',
          age: 38,
          lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          upcomingAppointment: {
            date: today,
            time: '9:00 AM',
          },
        },
        {
          id: '2',
          name: 'John Smith',
          image: 'https://randomuser.me/api/portraits/men/32.jpg',
          age: 45,
          lastVisit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
          upcomingAppointment: {
            date: today,
            time: '11:00 AM',
          },
        },
        {
          id: '3',
          name: 'Michael Johnson',
          image: 'https://randomuser.me/api/portraits/men/45.jpg',
          age: 29,
          lastVisit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          upcomingAppointment: {
            date: today,
            time: '2:00 PM',
          },
        },
        {
          id: '4',
          name: 'Emily Williams',
          image: 'https://randomuser.me/api/portraits/women/45.jpg',
          age: 52,
          lastVisit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
          upcomingAppointment: {
            date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            time: '10:30 AM',
          },
        },
      ]);

      setPendingRecords([
        {
          id: '1',
          patientName: 'Jane Doe',
          title: 'Physical Examination Report',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          status: 'PENDING',
        },
        {
          id: '2',
          patientName: 'John Smith',
          title: 'Blood Test Results',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          status: 'PENDING',
        },
      ]);

      setUnreadMessages([
        {
          id: '1',
          senderId: '1',
          content: 'Thank you for the prescription. I had a question about the dosage instructions.',
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          read: false,
          sender: {
            name: 'Jane Doe',
            image: 'https://randomuser.me/api/portraits/women/90.jpg',
          },
        },
        {
          id: '2',
          senderId: '2',
          content: 'I\'ve been taking the medication for a week now and I\'m experiencing some side effects.',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          read: false,
          sender: {
            name: 'John Smith',
            image: 'https://randomuser.me/api/portraits/men/32.jpg',
          },
        },
      ]);

      setStats({
        totalAppointmentsToday: 5,
        patientsSeenThisWeek: 18,
        upcomingAppointments: 12,
        averageConsultationTime: 25, // minutes
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
      <h1 className="text-2xl font-bold mb-6">Welcome, Dr. {session?.user?.name?.split(' ')[1]}</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Today's Appointments</p>
          <p className="text-3xl font-bold text-blue-600">{stats.totalAppointmentsToday}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Patients This Week</p>
          <p className="text-3xl font-bold text-green-600">{stats.patientsSeenThisWeek}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Upcoming Appointments</p>
          <p className="text-3xl font-bold text-purple-600">{stats.upcomingAppointments}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Avg. Consultation</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.averageConsultationTime} min</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Today's Appointments</h2>
            <Link href="/appointments" className="text-blue-500 hover:text-blue-700 text-sm">
              View All
            </Link>
          </div>
          {todayAppointments.length === 0 ? (
            <p className="text-gray-500">No appointments scheduled for today</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todayAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={appointment.patient.image || "/default-avatar.png"}
                              alt={appointment.patient.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patient.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.title}
                        {appointment.isVirtual && (
                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            Virtual
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">
                        <Link href={`/appointments/${appointment.id}`} className="mr-3">
                          View
                        </Link>
                        {appointment.isVirtual && appointment.virtualLink && (
                          <a 
                            href={appointment.virtualLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-500"
                          >
                            Join
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending Medical Records */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Pending Records</h2>
            <Link href="/medical-records" className="text-blue-500 hover:text-blue-700 text-sm">
              View All
            </Link>
          </div>
          {pendingRecords.length === 0 ? (
            <p className="text-gray-500">No pending records</p>
          ) : (
            <div className="space-y-4">
              {pendingRecords.map((record) => (
                <div key={record.id} className="border-l-4 border-yellow-500 pl-4 py-2">
                  <p className="font-medium">{record.title}</p>
                  <p className="text-sm text-gray-600">Patient: {record.patientName}</p>
                  <p className="text-sm text-gray-600">{formatDate(record.date)}</p>
                  <div className="mt-2 flex space-x-2">
                    <Link href={`/medical-records/${record.id}/complete`} className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">
                      Complete
                    </Link>
                    <Link href={`/medical-records/${record.id}`} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Patients */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Patients</h2>
            <Link href="/patients" className="text-blue-500 hover:text-blue-700 text-sm">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="border rounded-lg p-4 flex items-start space-x-4">
                <img
                  src={patient.image || "/default-avatar.png"}
                  alt={patient.name}
                  className="h-12 w-12 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{patient.name}</h3>
                  <p className="text-sm text-gray-500">Age: {patient.age}</p>
                  <p className="text-sm text-gray-500">Last Visit: {formatDate(patient.lastVisit)}</p>
                  {patient.upcomingAppointment && (
                    <p className="text-sm text-blue-500">
                      Next Appointment: {formatDate(patient.upcomingAppointment.date)} at {patient.upcomingAppointment.time}
                    </p>
                  )}
                  <div className="mt-2">
                    <Link href={`/patients/${patient.id}`} className="text-sm text-blue-500 hover:text-blue-700">
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                <div key={message.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center">
                    <img
                      src={message.sender.image || "/default-avatar.png"}
                      alt={message.sender.name}
                      className="h-8 w-8 rounded-full mr-2"
                    />
                    <div>
                      <p className="font-medium">{message.sender.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-800 mt-2 line-clamp-2">{message.content}</p>
                  <Link href={`/messages#${message.senderId}`} className="mt-1 inline-block text-sm text-blue-500 hover:text-blue-700">
                    Reply
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-3">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Schedule Appointment</span>
            </button>
            <button className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Create Prescription</span>
            </button>
            <button className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>View Patient List</span>
            </button>
            <button className="bg-yellow-500 text-white p-4 rounded-lg hover:bg-yellow-600 flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>My Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 