import { Box, Paper, Typography, TextField, Button, Alert, CircularProgress, Link } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const ResetPasswordForm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ password: string; confirmPassword: string }>({
    password: '',
    confirmPassword: '',
  });
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  // Check if we have a valid reset token on component mount
  const checkResetToken = useCallback(async () => {
    console.log('ResetPasswordForm - Checking for valid session...');
    try {
      const { data, error } = await supabase.auth.getSession();

      console.log('ResetPasswordForm - Session check result:', {
        hasSession: !!data.session,
        error: error?.message,
        sessionUser: data.session?.user?.email,
      });

      if (error) {
        console.error('Session check error:', error);
        setApiError('Invalid or expired reset link. Please request a new password reset.');
        return;
      }

      // If we have a session, the token is valid
      if (data.session) {
        console.log('Valid reset session found');
        setIsValidToken(true);
      } else {
        console.log('No valid session found');
        setApiError('Invalid or expired reset link. Please request a new password reset.');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setApiError('Invalid or expired reset link. Please request a new password reset.');
    }
  }, []);

  useEffect(() => {
    void checkResetToken();
  }, [checkResetToken]);

  const validateForm = useCallback(() => {
    const newErrors: { password: string; confirmPassword: string } = {
      password: '',
      confirmPassword: '',
    };

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !newErrors.password && !newErrors.confirmPassword;
  }, [password, confirmPassword]);

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

      const submitPassword = async () => {
        try {
          await updatePassword(password);
          setSuccessMessage('Password updated successfully! Redirecting to login...');

          // Redirect to login after a short delay
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } catch (error) {
          console.error('Password update error:', error);
          setApiError(error instanceof Error ? error.message : 'Failed to update password. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      void submitPassword();
    },
    [password, updatePassword, navigate, validateForm]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      if (errors.password) {
        setErrors(prev => ({ ...prev, password: '' }));
      }
      if (apiError) {
        setApiError('');
      }
      if (successMessage) {
        setSuccessMessage('');
      }
    },
    [errors.password, apiError, successMessage]
  );

  const handleConfirmPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfirmPassword(e.target.value);
      if (errors.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
      if (apiError) {
        setApiError('');
      }
      if (successMessage) {
        setSuccessMessage('');
      }
    },
    [errors.confirmPassword, apiError, successMessage]
  );

  // Show loading state while checking token
  if (!isValidToken && !apiError) {
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
            textAlign: 'center',
          }}
        >
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="h6">Validating reset link...</Typography>
        </Paper>
      </Box>
    );
  }

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
          Set New Password
        </Typography>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Enter your new password below.
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
            label="New Password"
            type="password"
            margin="normal"
            required
            autoComplete="new-password"
            value={password}
            onChange={handlePasswordChange}
            disabled={loading || !isValidToken}
            error={!!errors.password}
            helperText={errors.password || undefined}
            inputProps={{ 'data-testid': 'password' }}
          />

          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            margin="normal"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            disabled={loading || !isValidToken}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword || undefined}
            inputProps={{ 'data-testid': 'confirm-password' }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !isValidToken}
            data-testid="update-button"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
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

export default ResetPasswordForm;
