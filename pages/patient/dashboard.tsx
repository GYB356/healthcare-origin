import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Messages from "../../components/patient/Messages";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function PatientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Patient Dashboard</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Messages</h2>
                <Messages />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-4">
                <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                  Book Appointment
                </button>
                <button className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                  View Prescriptions
                </button>
                <button className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600">
                  Medical History
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
