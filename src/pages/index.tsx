import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Box, CircularProgress } from '@mui/material';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      // Redirect based on user role
      const role = session?.user?.role?.toLowerCase() || 'patient';
      router.push(`/${role}`);
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  // Show loading while checking authentication
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
} 