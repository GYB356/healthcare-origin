import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  ClipboardDocumentListIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  status: string;
  doctor: {
    firstName: string;
    lastName: string;
  };
}

export default function Prescriptions() {
  const { data: session } = useSession();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [filter, setFilter] = useState<string>("all"); // all, active, completed

  useEffect(() => {
    fetchPrescriptions();
  }, [filter]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/patient/prescriptions?filter=${filter}`);
      if (!response.ok) {
        throw new Error("Failed to fetch prescriptions");
      }
      const data = await response.json();
      setPrescriptions(data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setError("Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isPrescriptionExpired = (endDate: string | null) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Prescriptions</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded ${
              filter === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Prescriptions
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-2 rounded ${
              filter === "active"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded ${
              filter === "completed"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {prescriptions.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No prescriptions</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your prescriptions will appear here once they are prescribed.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{prescription.medication}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {prescription.dosage} - {prescription.frequency}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {isPrescriptionExpired(prescription.endDate) && (
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                  )}
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      prescription.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {prescription.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  <span>
                    Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}
                  </span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  <span>Started: {formatDate(prescription.startDate)}</span>
                </div>
                {prescription.endDate && (
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    <span>Ends: {formatDate(prescription.endDate)}</span>
                  </div>
                )}
              </div>

              {prescription.notes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                  <p className="mt-1 text-sm text-gray-500">{prescription.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
