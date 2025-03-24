import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

const PatientDashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Patient Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Appointments Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Upcoming Appointments</Typography>
            {/* Appointment list will go here */}
          </Paper>
        </Grid>

        {/* Health Status Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Health Status</Typography>
            {/* Health status content will go here */}
          </Paper>
        </Grid>

        {/* Messages Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Messages</Typography>
            {/* Messages content will go here */}
          </Paper>
        </Grid>

        {/* Medical Records Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Medical Records</Typography>
            {/* Medical records content will go here */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientDashboard; 