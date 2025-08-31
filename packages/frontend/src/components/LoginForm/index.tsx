import { Box, Paper, Typography, TextField, Button, Link, Alert, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import type { UserProfile } from '../../contexts/AuthContextDef';

const LocationStateSchema = z.object({
  needsVerification: z.boolean().optional(),
  registrationComplete: z.boolean().optional(),
});

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email: string; password: string }>({ email: '', password: '' });
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const parseResult = LocationStateSchema.safeParse(location.state);

    if (parseResult.success) {
      const state = parseResult.data;

      if (state.needsVerification) {
        setSuccessMessage('Registration successful! Please check your email to verify your account.');
        navigate(location.pathname, { replace: true });
      } else if (state.registrationComplete) {
        setSuccessMessage('Registration successful! You can now sign in.');
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location, navigate]);

  const validateForm = () => {
    const newErrors: { email: string; password: string } = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    login(email, password, (userProfile: UserProfile | null) => {
      // This callback is called after the profile is loaded
      if (userProfile?.role === 'admin' || userProfile?.role === 'super_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    })
      .then(result => {
        // If no callback was provided, use the default redirect logic
        if (!result) {
          navigate('/dashboard');
        }
      })
      .catch(error => {
        console.error('Error logging in:', error);
        setApiError('Invalid credentials. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 64px)',
        justifyContent: 'center',
        alignItems: 'center',
        px: { xs: 2, sm: 4, md: 0 },
        py: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Sign In
        </Typography>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Welcome back to GazaTrustMe
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }} data-testid="success-message">
            {successMessage}
          </Alert>
        )}

        {apiError && (
          <Alert severity="error" sx={{ mb: 3 }} data-testid="error-message">
            {apiError}
          </Alert>
        )}

        <Box component="form" onSubmit={e => void handleSubmit(e)} sx={{ mt: 2 }} noValidate>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            required
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
            disabled={loading}
            error={!!errors.email}
            helperText={errors.email || undefined}
            inputProps={{ 'data-testid': 'email' }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            required
            autoComplete="current-password"
            value={password}
            onChange={handlePasswordChange}
            disabled={loading}
            error={!!errors.password}
            helperText={errors.password || undefined}
            inputProps={{ 'data-testid': 'password' }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
            data-testid="login-button"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>

          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot your password?
              </Link>
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link component={RouterLink} to="/register" variant="body2">
                Create one
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm;
