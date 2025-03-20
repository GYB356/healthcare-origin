import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('doctor' | 'patient')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user && allowedRoles && !allowedRoles.includes(session.user.role)) {
      router.push(session.user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    }
  }, [session, status, router, allowedRoles]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return null;
  }

  return <>{children}</>;
} 