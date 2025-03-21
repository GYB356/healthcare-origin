import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatDate } from '../../lib/formatDate';
import LoadingSpinner from '../LoadingSpinner';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  image?: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'OFF_DUTY';
}

interface SystemAlert {
  id: string;
  type: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface Stat {
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [selectedChart, setSelectedChart] = useState<'appointments' | 'revenue' | 'patients'>('appointments');

  useEffect(() => {
    // This would normally fetch data from the API
    // For now, we're using mock data
    setTimeout(() => {
      setStaffMembers([
        {
          id: '1',
          name: 'Dr. Smith',
          role: 'Doctor',
          department: 'Cardiology',
          image: 'https://randomuser.me/api/portraits/men/75.jpg',
          status: 'ACTIVE',
        },
        {
          id: '2',
          name: 'Dr. Johnson',
          role: 'Doctor',
          department: 'Neurology',
          image: 'https://randomuser.me/api/portraits/women/68.jpg',
          status: 'ACTIVE',
        },
        {
          id: '3',
          name: 'Nancy Nurse',
          role: 'Nurse',
          department: 'Cardiology',
          image: 'https://randomuser.me/api/portraits/women/45.jpg',
          status: 'ON_LEAVE',
        },
        {
          id: '4',
          name: 'Sam Staff',
          role: 'Staff',
          department: 'Billing',
          image: 'https://randomuser.me/api/portraits/men/35.jpg',
          status: 'OFF_DUTY',
        },
      ]);

      setSystemAlerts([
        {
          id: '1',
          type: 'ERROR',
          message: 'Database connection failed - Electronic Health Records',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          resolved: false,
        },
        {
          id: '2',
          type: 'WARNING',
          message: 'Low disk space on primary server',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          resolved: false,
        },
        {
          id: '3',
          type: 'INFO',
          message: 'System updates scheduled for tonight at 2 AM',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
          resolved: false,
        },
        {
          id: '4',
          type: 'ERROR',
          message: 'Payment processing service unreachable',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          resolved: true,
        },
      ]);

      setStats([
        {
          name: 'Total Patients',
          value: 1254,
          change: 12,
          changeType: 'increase',
        },
        {
          name: 'Appointments Today',
          value: 87,
          change: 8,
          changeType: 'increase',
        },
        {
          name: 'Staff On Duty',
          value: 42,
          change: 3,
          changeType: 'decrease',
        },
        {
          name: 'Total Revenue',
          value: 28650,
          change: 6,
          changeType: 'increase',
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const handleResolveAlert = (alertId: string) => {
    setSystemAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Administrator Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-sm text-gray-500">{stat.name}</p>
            <p className="text-3xl font-bold text-blue-600">
              {stat.name === 'Total Revenue' ? `$${stat.value.toLocaleString()}` : stat.value}
            </p>
            <div className="flex items-center mt-2">
              <span className={`text-sm ${
                stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.changeType === 'increase' ? '↑' : '↓'} {stat.change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">from last week</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Analytics</h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setSelectedChart('appointments')}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedChart === 'appointments' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                Appointments
              </button>
              <button 
                onClick={() => setSelectedChart('revenue')}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedChart === 'revenue' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                Revenue
              </button>
              <button 
                onClick={() => setSelectedChart('patients')}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedChart === 'patients' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                Patients
              </button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <div className="text-center">
              <p className="text-gray-500">Chart visualization would go here</p>
              <p className="text-sm text-gray-400">Showing data for: {selectedChart}</p>
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">System Alerts</h2>
            <Link href="/system/alerts" className="text-blue-500 hover:text-blue-700 text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {systemAlerts.filter(alert => !alert.resolved).map((alert) => (
              <div key={alert.id} className={`border-l-4 pl-4 py-2 ${
                alert.type === 'ERROR' ? 'border-red-500' : 
                alert.type === 'WARNING' ? 'border-yellow-500' : 
                'border-blue-500'
              }`}>
                <div className="flex justify-between">
                  <p className="font-medium">{alert.message}</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    alert.type === 'ERROR' ? 'bg-red-100 text-red-800' : 
                    alert.type === 'WARNING' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="mt-2">
                  <button 
                    onClick={() => handleResolveAlert(alert.id)}
                    className="text-sm bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Overview */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Staff Overview</h2>
            <Link href="/staff" className="text-blue-500 hover:text-blue-700 text-sm">
              Manage Staff
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staffMembers.map((staff) => (
                  <tr key={staff.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={staff.image || "/default-avatar.png"}
                            alt={staff.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {staff.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {staff.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {staff.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        staff.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                        staff.status === 'ON_LEAVE' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {staff.status === 'ACTIVE' ? 'Active' : 
                         staff.status === 'ON_LEAVE' ? 'On Leave' : 
                         'Off Duty'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link href={`/staff/${staff.id}`} className="text-blue-500 hover:text-blue-700 mr-3">
                        View
                      </Link>
                      <Link href={`/staff/${staff.id}/edit`} className="text-yellow-500 hover:text-yellow-700">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* HIPAA Compliance */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">HIPAA Compliance</h2>
            <Link href="/system/compliance" className="text-blue-500 hover:text-blue-700 text-sm">
              View Details
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Last Audit</p>
                <p className="text-sm text-gray-600">March 15, 2023</p>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                PASSED
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">User Access Reviews</p>
                <p className="text-sm text-gray-600">Last performed: 7 days ago</p>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                COMPLETED
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Security Risk Assessment</p>
                <p className="text-sm text-gray-600">Due in 23 days</p>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                SCHEDULED
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Staff Training Compliance</p>
                <p className="text-sm text-gray-600">92% completed</p>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                PENDING
              </span>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/system/compliance/report" className="block w-full bg-blue-500 text-white text-center py-2 rounded-md hover:bg-blue-600">
              Generate Compliance Report
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-3">
          <h2 className="text-lg font-semibold mb-4">Administrative Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add User</span>
            </button>
            <button className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Generate Reports</span>
            </button>
            <button className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>System Settings</span>
            </button>
            <button className="bg-yellow-500 text-white p-4 rounded-lg hover:bg-yellow-600 flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Backup Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 