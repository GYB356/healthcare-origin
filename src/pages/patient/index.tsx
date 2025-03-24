import { useSession } from 'next-auth/react';
import { Box, Typography } from '@mui/material';

export default function PatientDashboard() {
  const { data: session } = useSession();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {session?.user?.name}
      </Typography>
      <Typography variant="body1">
        This is your patient dashboard. More features coming soon.
      </Typography>
    </Box>
  );
} 