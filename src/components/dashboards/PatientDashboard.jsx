import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MessageIcon from "@mui/icons-material/Message";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { withAuth, ROLES } from "../withAuth";
import { useSocket } from "../../hooks/useSocket";
import { useSession } from "next-auth/react";

const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: "#f5f5f5",
  minHeight: "100vh",
}));

const DashboardCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: "100%",
  borderRadius: "12px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#ffffff",
}));

const PatientDashboard = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { onAppointmentUpdate, onNewNotification } = useSocket();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appointmentsRes, healthStatusRes, notificationsRes] = await Promise.all([
          fetch("/api/patient/appointments?page=1&pageSize=5"),
          fetch("/api/patient/health-status"),
          fetch("/api/patient/notifications?page=1&pageSize=5"),
        ]);

        const [appointmentsData, healthStatusData, notificationsData] = await Promise.all([
          appointmentsRes.json(),
          healthStatusRes.json(),
          notificationsRes.json(),
        ]);

        setAppointments(appointmentsData.data || []);
        setHealthStatus(healthStatusData);
        setNotifications(notificationsData.data || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchDashboardData();
    }
  }, [session]);

  useEffect(() => {
    // Listen for real-time appointment updates
    onAppointmentUpdate((updatedAppointment) => {
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === updatedAppointment.id ? updatedAppointment : appointment
        )
      );
    });

    // Listen for new notifications
    onNewNotification((newNotification) => {
      setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]);
    });
  }, [onAppointmentUpdate, onNewNotification]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <DashboardContainer>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {session?.user?.name || "Patient"}
          </Typography>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6} lg={3}>
          <DashboardCard>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <List>
              <ListItem button>
                <IconButton color="primary">
                  <CalendarTodayIcon />
                </IconButton>
                <ListItemText primary="Schedule Appointment" />
              </ListItem>
              <ListItem button>
                <IconButton color="primary">
                  <MessageIcon />
                </IconButton>
                <ListItemText primary="Message Provider" />
              </ListItem>
              <ListItem button>
                <IconButton color="primary">
                  <AssignmentIcon />
                </IconButton>
                <ListItemText primary="View Medical Records" />
              </ListItem>
            </List>
          </DashboardCard>
        </Grid>

        {/* Upcoming Appointments */}
        <Grid item xs={12} md={6} lg={3}>
          <DashboardCard>
            <Typography variant="h6" gutterBottom>
              Upcoming Appointments
            </Typography>
            <List>
              {appointments.map((appointment) => (
                <ListItem key={appointment.id}>
                  <ListItemText
                    primary={appointment.providerName}
                    secondary={new Date(appointment.date).toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          </DashboardCard>
        </Grid>

        {/* Health Status */}
        <Grid item xs={12} md={6} lg={3}>
          <DashboardCard>
            <Typography variant="h6" gutterBottom>
              Health Status
            </Typography>
            <List>
              {healthStatus && (
                <>
                  <ListItem>
                    <ListItemText
                      primary="Blood Pressure"
                      secondary={healthStatus.bloodPressure}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Last Check-up"
                      secondary={new Date(healthStatus.lastCheckup).toLocaleDateString()}
                    />
                  </ListItem>
                </>
              )}
            </List>
          </DashboardCard>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6} lg={3}>
          <DashboardCard>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            <List>
              {notifications.map((notification) => (
                <ListItem key={notification.id}>
                  <IconButton color="primary">
                    <NotificationsIcon />
                  </IconButton>
                  <ListItemText
                    primary={notification.title}
                    secondary={notification.message}
                  />
                </ListItem>
              ))}
            </List>
          </DashboardCard>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default withAuth(PatientDashboard, [ROLES.PATIENT]); 