import { useSession } from 'next-auth/react';
import { Box, Typography } from '@mui/material';

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {session?.user?.name}
      </Typography>
      <Typography variant="body1">
        This is your admin dashboard. More features coming soon.
      </Typography>
    </Box>
  );
} 