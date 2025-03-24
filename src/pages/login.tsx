import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
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
  SelectChangeEvent,
} from '@mui/material';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (result?.error) {
        setError('Invalid credentials');
        return;
      }

      // Redirect based on role
      router.push(`/${formData.role}`);
    } catch (err) {
      setError('An error occurred during login');
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      role: e.target.value,
    }));
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
          Healthcare Platform
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
            onChange={handleTextChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleTextChange}
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleRoleChange}
              label="Role"
            >
              <MenuItem value="patient">Patient</MenuItem>
              <MenuItem value="doctor">Healthcare Provider</MenuItem>
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
} 