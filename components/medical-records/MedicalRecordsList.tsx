import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import MedicalRecordForm from "./MedicalRecordForm";

interface MedicalRecord {
  id: string;
  title: string;
  description: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  patient: {
    name: string;
  };
  doctor: {
    name: string;
  };
}

interface MedicalRecordsListProps {
  patientId?: string;
}

export default function MedicalRecordsList({ patientId }: MedicalRecordsListProps) {
  const { data: session } = useSession();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  const fetchRecords = async () => {
    try {
      const response = await fetch(
        `/api/medical-records${patientId ? `?patientId=${patientId}` : ""}`,
      );
      const data = await response.json();
      setRecords(data.records);
    } catch (error) {
      toast.error("Failed to fetch medical records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [patientId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      const response = await fetch(`/api/medical-records/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Medical record deleted successfully");
        fetchRecords();
      } else {
        toast.error("Failed to delete medical record");
      }
    } catch (error) {
      toast.error("Error deleting medical record");
    }
  };

  const handleEdit = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setShowForm(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {showForm ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">
              {selectedRecord ? "Edit Medical Record" : "New Medical Record"}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setSelectedRecord(null);
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              Close
            </button>
          </div>
          <MedicalRecordForm
            patientId={patientId || ""}
            initialData={selectedRecord}
            onSuccess={() => {
              setShowForm(false);
              setSelectedRecord(null);
              fetchRecords();
            }}
          />
        </div>
      ) : (
        <>
          {session?.user?.role === "DOCTOR" && patientId && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add New Record
            </button>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {records.map((record) => (
                <li key={record.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{record.title}</h4>
                      <p className="mt-1 text-sm text-gray-600">{record.description}</p>
                      {record.diagnosis && (
                        <p className="mt-1 text-sm text-gray-600">
                          <strong>Diagnosis:</strong> {record.diagnosis}
                        </p>
                      )}
                      {record.prescription && (
                        <p className="mt-1 text-sm text-gray-600">
                          <strong>Prescription:</strong> {record.prescription}
                        </p>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        <p>Created by Dr. {record.doctor.name}</p>
                        <p>
                          {new Date(record.createdAt).toLocaleDateString()} at{" "}
                          {new Date(record.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {session?.user?.role === "DOCTOR" && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
              {records.length === 0 && (
                <li className="px-6 py-4 text-center text-gray-500">No medical records found.</li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
