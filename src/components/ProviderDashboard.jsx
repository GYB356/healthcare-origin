import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

const ProviderDashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Healthcare Provider Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Patient List */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">My Patients</Typography>
            {/* Patient list with quick actions will go here */}
          </Paper>
        </Grid>

        {/* Appointments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Today's Schedule</Typography>
            {/* Today's appointments will go here */}
          </Paper>
        </Grid>

        {/* Tasks and Follow-ups */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Tasks & Follow-ups</Typography>
            {/* Task list and follow-up reminders will go here */}
          </Paper>
        </Grid>

        {/* Messages */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Messages</Typography>
            {/* Message center will go here */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProviderDashboard; 