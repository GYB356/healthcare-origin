import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

interface LabResult {
  id: string;
  testName: string;
  result: string;
  referenceRange: string | null;
  date: string;
  notes: string | null;
  doctor: {
    firstName: string;
    lastName: string;
  };
}

export default function LabResults() {
  const { data: session } = useSession();
  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [filter, setFilter] = useState<string>("all"); // all, recent, past

  useEffect(() => {
    fetchLabResults();
  }, [filter]);

  const fetchLabResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/patient/lab-results?filter=${filter}`);
      if (!response.ok) {
        throw new Error("Failed to fetch lab results");
      }
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching lab results:", error);
      setError("Failed to load lab results");
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

  const isResultAbnormal = (result: string, referenceRange: string | null) => {
    if (!referenceRange) return false;

    // Simple comparison - in a real application, this would need more sophisticated logic
    const [min, max] = referenceRange.split("-").map(Number);
    const value = parseFloat(result);

    return value < min || value > max;
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
        <h2 className="text-2xl font-bold text-gray-900">Lab Results</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded ${
              filter === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setFilter("recent")}
            className={`px-4 py-2 rounded ${
              filter === "recent"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setFilter("past")}
            className={`px-4 py-2 rounded ${
              filter === "past"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No lab results</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your lab results will appear here once they are available.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{result.testName}</h3>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      Result: {result.result}
                    </span>
                    {result.referenceRange && (
                      <span className="text-sm text-gray-500">
                        (Reference: {result.referenceRange})
                      </span>
                    )}
                  </div>
                </div>
                {isResultAbnormal(result.result, result.referenceRange) && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Abnormal
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  <span>
                    Dr. {result.doctor.firstName} {result.doctor.lastName}
                  </span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  <span>Date: {formatDate(result.date)}</span>
                </div>
              </div>

              {result.notes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                  <p className="mt-1 text-sm text-gray-500">{result.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
