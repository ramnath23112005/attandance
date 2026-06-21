import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Link, Alert,
  InputAdornment, IconButton, Avatar, Stack,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
          maxWidth: 420,
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
            Welcome Back
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.8)">
            Sign in to your Attandance account
          </Typography>
        </Box>

        <CardContent sx={{ px: 4, py: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#546e7a', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#546e7a', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box textAlign="right" mb={3}>
              <Link href="#" variant="caption" color="text.secondary" underline="hover">
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              disableElevation
              sx={{
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
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <Stack direction="row" spacing={1} justifyContent="center" mt={3}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?
            </Typography>
            <Link component={RouterLink} to="/register" variant="body2" fontWeight={700} underline="hover">
              Register
            </Link>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
