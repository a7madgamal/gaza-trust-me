import { Box, Paper, Typography, TextField, Button, Alert, CircularProgress, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email: string }>({ email: '' });
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { resetPasswordForEmail } = useAuth();

  const validateForm = useCallback(() => {
    const newErrors: { email: string } = { email: '' };

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return !newErrors.email;
  }, [email]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setApiError('');
      setSuccessMessage('');
      setLoading(true);

      if (!validateForm()) {
        setLoading(false);
        return;
      }

      const submitReset = async () => {
        try {
          await resetPasswordForEmail(email);
          setSuccessMessage('Password reset email sent! Please check your inbox.');
          setEmail('');
        } catch (error) {
          console.error('Password reset error:', error);
          setApiError(error instanceof Error ? error.message : 'Failed to send reset email. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      void submitReset();
    },
    [email, resetPasswordForEmail, validateForm]
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      if (errors.email) {
        setErrors(prev => ({ ...prev, email: '' }));
      }
      if (apiError) {
        setApiError('');
      }
      if (successMessage) {
        setSuccessMessage('');
      }
    },
    [errors.email, apiError, successMessage]
  );

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
          Reset Password
        </Typography>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Enter your email address and we'll send you a link to reset your password.
        </Typography>

        {apiError && (
          <Alert severity="error" sx={{ mb: 3 }} data-testid="error-message">
            {apiError}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }} data-testid="success-message">
            {successMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }} noValidate>
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
            data-testid="reset-button"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Email'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Remember your password?{' '}
              <Link component={RouterLink} to="/login" variant="body2">
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPasswordForm;
