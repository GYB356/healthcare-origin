import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface MedicalRecord {
  id: string;
  condition: string;
  diagnosis: string;
  treatment: string;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  doctor: {
    firstName: string;
    lastName: string;
  };
}

export default function MedicalHistory() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<string>('all'); // all, active, resolved

  useEffect(() => {
    fetchMedicalHistory();
  }, [filter]);

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/patient/medical-history?filter=${filter}`);
      if (!response.ok) {
        throw new Error('Failed to fetch medical history');
      }
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching medical history:', error);
      setError('Failed to load medical history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Medical History</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Records
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded ${
              filter === 'active'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active Conditions
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded ${
              filter === 'resolved'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Resolved Conditions
          </button>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No medical records</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your medical history will appear here once records are added.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {record.condition}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {record.diagnosis}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    record.endDate
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {record.endDate ? 'Resolved' : 'Active'}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  <span>
                    Dr. {record.doctor.firstName} {record.doctor.lastName}
                  </span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  <span>Started: {formatDate(record.startDate)}</span>
                </div>
                {record.endDate && (
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    <span>Resolved: {formatDate(record.endDate)}</span>
                  </div>
                )}
              </div>

              {record.treatment && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Treatment</h4>
                  <p className="mt-1 text-sm text-gray-500">{record.treatment}</p>
                </div>
              )}

              {record.notes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                  <p className="mt-1 text-sm text-gray-500">{record.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 