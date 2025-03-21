import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { UserRole } from '@prisma/client';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import NurseDashboard from './NurseDashboard';
import AdminDashboard from './AdminDashboard';
import StaffDashboard from './StaffDashboard';
import LoadingSpinner from '../LoadingSpinner';

interface SessionUser {
  role: UserRole;
}

interface ExtendedSession {
  user?: SessionUser;
}

export default function DashboardRouter() {
  const { data: session, status } = useSession() as { data: ExtendedSession | null, status: string };
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  // Determine which dashboard to show based on user role
  switch (session.user.role) {
    case UserRole.PATIENT:
      return <PatientDashboard />;
    case UserRole.DOCTOR:
      return <DoctorDashboard />;
    case UserRole.NURSE:
      return <NurseDashboard />;
    case UserRole.ADMIN:
      return <AdminDashboard />;
    case UserRole.STAFF:
      return <StaffDashboard />;
    default:
      // Default to patient dashboard if role is not recognized
      return <PatientDashboard />;
  }
}