import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatDate } from '../../lib/formatDate';
import LoadingSpinner from '../LoadingSpinner';

interface Patient {
  id: string;
  name: string;
  image?: string;
  room?: string;
  status: string;
  vitals?: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    oxygenSaturation: string;
    lastUpdated: Date;
  };
}

interface Task {
  id: string;
  patientName: string;
  patientId: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueTime: Date;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  assignedBy: string;
}

interface MedicationSchedule {
  id: string;
  patientId: string;
  patientName: string;
  medication: string;
  dosage: string;
  time: Date;
  administered: boolean;
}

export default function NurseDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [medicationSchedules, setMedicationSchedules] = useState<MedicationSchedule[]>([]);
  const [stats, setStats] = useState({
    patientsAssigned: 0,
    pendingTasks: 0,
    medicationsDue: 0,
    criticalPatients: 0,
  });

  useEffect(() => {
    // This would normally fetch data from the API
    // For now, we're using mock data
    setTimeout(() => {
      setPatients([
        {
          id: '1',
          name: 'Jane Doe',
          image: 'https://randomuser.me/api/portraits/women/90.jpg',
          room: '101A',
          status: 'Stable',
          vitals: {
            bloodPressure: '120/80',
            heartRate: '72',
            temperature: '98.6',
            oxygenSaturation: '98%',
            lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          },
        },
        {
          id: '2',
          name: 'John Smith',
          image: 'https://randomuser.me/api/portraits/men/32.jpg',
          room: '103B',
          status: 'Needs Attention',
          vitals: {
            bloodPressure: '140/90',
            heartRate: '88',
            temperature: '99.2',
            oxygenSaturation: '95%',
            lastUpdated: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          },
        },
        {
          id: '3',
          name: 'Emily Williams',
          image: 'https://randomuser.me/api/portraits/women/45.jpg',
          room: '105A',
          status: 'Critical',
          vitals: {
            bloodPressure: '160/100',
            heartRate: '110',
            temperature: '101.3',
            oxygenSaturation: '92%',
            lastUpdated: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          },
        },
        {
          id: '4',
          name: 'Michael Johnson',
          image: 'https://randomuser.me/api/portraits/men/45.jpg',
          room: '102C',
          status: 'Stable',
          vitals: {
            bloodPressure: '118/78',
            heartRate: '68',
            temperature: '98.4',
            oxygenSaturation: '99%',
            lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          },
        },
      ]);

      const now = new Date();
      
      setTasks([
        {
          id: '1',
          patientName: 'Jane Doe',
          patientId: '1',
          description: 'Administer IV medication',
          priority: 'MEDIUM',
          dueTime: new Date(now.getTime() + 1 * 60 * 60 * 1000), // 1 hour from now
          status: 'PENDING',
          assignedBy: 'Dr. Smith',
        },
        {
          id: '2',
          patientName: 'John Smith',
          patientId: '2',
          description: 'Check blood pressure and update chart',
          priority: 'HIGH',
          dueTime: new Date(now.getTime() + 30 * 60 * 1000), // 30 min from now
          status: 'PENDING',
          assignedBy: 'Dr. Johnson',
        },
        {
          id: '3',
          patientName: 'Emily Williams',
          patientId: '3',
          description: 'Monitor vitals every 15 minutes',
          priority: 'HIGH',
          dueTime: new Date(now.getTime() + 15 * 60 * 1000), // 15 min from now
          status: 'IN_PROGRESS',
          assignedBy: 'Dr. Smith',
        },
        {
          id: '4',
          patientName: 'Michael Johnson',
          patientId: '4',
          description: 'Assist with physical therapy exercises',
          priority: 'LOW',
          dueTime: new Date(now.getTime() + 3 * 60 * 60 * 1000), // 3 hours from now
          status: 'PENDING',
          assignedBy: 'Dr. Williams',
        },
      ]);

      setMedicationSchedules([
        {
          id: '1',
          patientId: '1',
          patientName: 'Jane Doe',
          medication: 'Amoxicillin',
          dosage: '500mg',
          time: new Date(now.getTime() + 1 * 60 * 60 * 1000), // 1 hour from now
          administered: false,
        },
        {
          id: '2',
          patientId: '2',
          patientName: 'John Smith',
          medication: 'Lisinopril',
          dosage: '10mg',
          time: new Date(now.getTime() + 30 * 60 * 1000), // 30 min from now
          administered: false,
        },
        {
          id: '3',
          patientId: '3',
          patientName: 'Emily Williams',
          medication: 'Morphine',
          dosage: '5mg',
          time: new Date(now.getTime() + 15 * 60 * 1000), // 15 min from now
          administered: false,
        },
        {
          id: '4',
          patientId: '1',
          patientName: 'Jane Doe',
          medication: 'Acetaminophen',
          dosage: '650mg',
          time: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
          administered: true,
        },
      ]);

      setStats({
        patientsAssigned: 4,
        pendingTasks: 3,
        medicationsDue: 3,
        criticalPatients: 1,
      });

      setLoading(false);
    }, 1000);
  }, []);

  const handleMarkTaskComplete = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, status: 'COMPLETED' as const } : task
      )
    );
    setStats(prev => ({ ...prev, pendingTasks: prev.pendingTasks - 1 }));
  };

  const handleMedicationAdministered = (medicationId: string) => {
    setMedicationSchedules(prev => 
      prev.map(med => 
        med.id === medicationId ? { ...med, administered: true } : med
      )
    );
    setStats(prev => ({ ...prev, medicationsDue: prev.medicationsDue - 1 }));
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
      <h1 className="text-2xl font-bold mb-6">Nurse Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Assigned Patients</p>
          <p className="text-3xl font-bold text-blue-600">{stats.patientsAssigned}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Pending Tasks</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Medications Due</p>
          <p className="text-3xl font-bold text-green-600">{stats.medicationsDue}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Critical Patients</p>
          <p className="text-3xl font-bold text-red-600">{stats.criticalPatients}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Overview */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Patient Overview</h2>
            <Link href="/patients" className="text-blue-500 hover:text-blue-700 text-sm">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vitals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={patient.image || "/default-avatar.png"}
                            alt={patient.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.room}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        patient.status === 'Stable' ? 'bg-green-100 text-green-800' : 
                        patient.status === 'Needs Attention' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.vitals ? (
                        <div>
                          <div>BP: {patient.vitals.bloodPressure}</div>
                          <div>HR: {patient.vitals.heartRate}</div>
                          <div className="text-xs text-gray-500">
                            Updated: {new Date(patient.vitals.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">No vitals recorded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link href={`/patients/${patient.id}`} className="text-blue-500 hover:text-blue-700 mr-3">
                        View
                      </Link>
                      <Link href={`/patients/${patient.id}/vitals`} className="text-green-500 hover:text-green-700">
                        Update Vitals
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <Link href="/tasks" className="text-blue-500 hover:text-blue-700 text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {tasks.filter(task => task.status !== 'COMPLETED').map((task) => (
              <div key={task.id} className={`border-l-4 pl-4 py-2 ${
                task.priority === 'HIGH' ? 'border-red-500' : 
                task.priority === 'MEDIUM' ? 'border-yellow-500' : 
                'border-green-500'
              }`}>
                <div className="flex justify-between">
                  <p className="font-medium">{task.description}</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 
                    task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Patient: {task.patientName}</p>
                <p className="text-sm text-gray-600">
                  Due: {new Date(task.dueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-sm text-gray-600">Assigned by: {task.assignedBy}</p>
                <div className="mt-2 flex space-x-2">
                  {task.status === 'PENDING' ? (
                    <button 
                      onClick={() => handleMarkTaskComplete(task.id)}
                      className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                    >
                      Mark Complete
                    </button>
                  ) : (
                    <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md">
                      In Progress
                    </span>
                  )}
                  <Link href={`/patients/${task.patientId}`} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200">
                    View Patient
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medication Schedule */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Medication Schedule</h2>
            <Link href="/medications" className="text-blue-500 hover:text-blue-700 text-sm">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medication
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dosage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {medicationSchedules.map((med) => (
                  <tr key={med.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {med.patientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {med.medication}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {med.dosage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(med.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {med.administered ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Administered
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleMedicationAdministered(med.id)}
                          className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                        >
                          Administer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
              Record Vitals
            </button>
            <button className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600">
              Administer Medication
            </button>
            <button className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600">
              Add Patient Notes
            </button>
            <button className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600">
              View My Schedule
            </button>
            <button className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600">
              Request Assistance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 