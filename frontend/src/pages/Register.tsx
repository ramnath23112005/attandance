import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Link, Alert, MenuItem,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: UserRole.STUDENT, department: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role as UserRole,
        department: formData.department || undefined,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.100">
      <Card sx={{ maxWidth: 480, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={700} textAlign="center" color="primary" gutterBottom>
            Attandance
          </Typography>
          <Typography variant="body2" textAlign="center" color="text.secondary" mb={3}>
            Create a new account
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Full Name" value={formData.name} onChange={handleChange('name')} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Email" type="email" value={formData.email} onChange={handleChange('email')} required sx={{ mb: 2 }} />
            <TextField fullWidth label="Password" type="password" value={formData.password} onChange={handleChange('password')} required helperText="Min 8 chars, 1 uppercase, 1 lowercase, 1 number" sx={{ mb: 2 }} />
            <TextField fullWidth label="Confirm Password" type="password" value={formData.confirmPassword} onChange={handleChange('confirmPassword')} required sx={{ mb: 2 }} />
            <TextField fullWidth select label="Role" value={formData.role} onChange={handleChange('role')} sx={{ mb: 2 }}>
              <MenuItem value={UserRole.STUDENT}>Student</MenuItem>
              <MenuItem value={UserRole.FACULTY}>Faculty</MenuItem>
              <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
            </TextField>
            <TextField fullWidth label="Department" value={formData.department} onChange={handleChange('department')} sx={{ mb: 3 }} />

            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mb: 2 }}>
              {loading ? 'Creating account...' : 'Register'}
            </Button>
          </form>

          <Typography variant="body2" textAlign="center">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Sign In
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
