import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

const Login = () => {
  const router = useRouter();
  const { signIn } = useSession();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (result.error) {
        setError('Invalid credentials');
        return;
      }

      // Redirect based on role
      const redirectPath = `/${formData.role}`;
      router.push(redirectPath);
    } catch (err) {
      setError('An error occurred during login');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Healthcare Platform Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Role"
            >
              <MenuItem value="patient">Patient</MenuItem>
              <MenuItem value="provider">Healthcare Provider</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3 }}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login; 