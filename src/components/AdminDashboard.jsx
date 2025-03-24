import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

const AdminDashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* System Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">System Overview</Typography>
            {/* System metrics will go here */}
          </Paper>
        </Grid>

        {/* User Management */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">User Management</Typography>
            {/* User management controls will go here */}
          </Paper>
        </Grid>

        {/* Analytics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Analytics</Typography>
            {/* Analytics charts and data will go here */}
          </Paper>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">System Settings</Typography>
            {/* System configuration options will go here */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 