import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import PatientDashboard from '../../components/patient/PatientDashboard';
import PatientProfile from '../../components/patient/PatientProfile';
import MedicalHistory from '../../components/patient/MedicalHistory';
import Prescriptions from '../../components/patient/Prescriptions';
import LabResults from '../../components/patient/LabResults';
import PatientLayout from '../../components/layouts/PatientLayout';

export default function PatientDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <PatientLayout>
      <div className="max-w-7xl mx-auto">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Welcome, {session.user.name}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Dashboard */}
            <div className="lg:col-span-2">
              <PatientDashboard />
            </div>

            {/* Patient Profile */}
            <div className="lg:col-span-1">
              <PatientProfile />
            </div>
          </div>

          {/* Medical History */}
          <div className="mt-8">
            <MedicalHistory />
          </div>

          {/* Prescriptions */}
          <div className="mt-8">
            <Prescriptions />
          </div>

          {/* Lab Results */}
          <div className="mt-8">
            <LabResults />
          </div>
        </div>
      </div>
    </PatientLayout>
  );
} 