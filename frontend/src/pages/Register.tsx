import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Link, Alert, MenuItem, Avatar, Stack, InputAdornment,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import BadgeIcon from '@mui/icons-material/Badge';
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
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0d1b2a 0%, #1a237e 50%, #283593 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,188,212,0.15) 0%, transparent 70%)',
          top: -200,
          right: -200,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,188,212,0.1) 0%, transparent 70%)',
          bottom: -100,
          left: -100,
        },
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: '100%',
          mx: 2,
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative',
          zIndex: 1,
          overflow: 'visible',
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1a237e, #283593)',
            px: 4,
            py: 3,
            textAlign: 'center',
            position: 'relative',
            mt: -3,
            mx: 2,
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(26,35,126,0.35)',
          }}
        >
          <Avatar
            sx={{
              mx: 'auto',
              mb: 1,
              bgcolor: '#00bcd4',
              width: 48,
              height: 48,
              boxShadow: '0 4px 12px rgba(0,188,212,0.4)',
            }}
          >
            <SchoolIcon />
          </Avatar>
          <Typography variant="h5" fontWeight={800} color="#fff">
            Create Account
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.8)">
            Join Attandance today
          </Typography>
        </Box>

        <CardContent sx={{ px: 4, py: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={handleChange('name')}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#546e7a', fontSize: 20 }} /></InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#546e7a', fontSize: 20 }} /></InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange('password')}
                required
                helperText="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#546e7a', fontSize: 20 }} /></InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#546e7a', fontSize: 20 }} /></InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                select
                label="Role"
                value={formData.role}
                onChange={handleChange('role')}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: '#546e7a', fontSize: 20 }} /></InputAdornment>,
                }}
              >
                <MenuItem value={UserRole.STUDENT}>Student</MenuItem>
                <MenuItem value={UserRole.FACULTY}>Faculty</MenuItem>
                <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={handleChange('department')}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SchoolIcon sx={{ color: '#546e7a', fontSize: 20 }} /></InputAdornment>,
                }}
              />
            </Stack>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              disableElevation
              sx={{
                mt: 3,
                py: 1.5,
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #1a237e, #283593)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #283593, #3949ab)',
                },
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <Stack direction="row" spacing={1} justifyContent="center" mt={3}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?
            </Typography>
            <Link component={RouterLink} to="/login" variant="body2" fontWeight={700} underline="hover">
              Sign In
            </Link>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
