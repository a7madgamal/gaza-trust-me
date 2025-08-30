import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { Box, CircularProgress, Typography } from '@mui/material';
import { supabase } from '../../lib/supabase';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { userProfile, loading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if this is a password reset flow
        const type = searchParams.get('type');
        const next = searchParams.get('next');
        const tokenHash = searchParams.get('token_hash');

        console.log('AuthCallback - URL params:', { type, next, tokenHash });

        if (type === 'recovery' && next === '/reset-password') {
          // This is a password reset confirmation
          console.log('Processing password reset confirmation');

          // For password reset, we need to exchange the token for a session
          // The token_hash parameter contains the recovery token
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash || '',
            type: 'recovery',
          });

          console.log('Password reset OTP verification:', { hasSession: !!data.session, error });

          if (error) {
            console.error('Password reset OTP verification error:', error);
            showToast('Password reset link is invalid or expired', 'error');
            setTimeout(() => navigate('/forgot-password'), 2000);
            return;
          }

          if (data.session) {
            // Session is established, redirect to reset password page
            console.log('Password reset successful, redirecting to /reset-password');
            showToast('Password reset link validated successfully', 'success');
            navigate('/reset-password');
            return;
          } else {
            // No session found, redirect to forgot password
            console.log('No session found after OTP verification, redirecting to /forgot-password');
            showToast('Password reset link is invalid or expired', 'error');
            setTimeout(() => navigate('/forgot-password'), 2000);
            return;
          }
        }

        // Handle regular auth callback (email verification, etc.)
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Supabase auth session error:', error);
          showToast(`Authentication failed: ${error.message}`, 'error');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        if (data.session) {
          // Session is established, user is authenticated
          showToast('Authentication successful! Welcome', 'success');
          // Let the auth context handle the profile loading and redirect
          // We'll use a useEffect to watch for profile loading completion
        } else {
          // No session found, redirect to login
          showToast('Authentication failed. Please try again.', 'error');
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        showToast(error instanceof Error ? error.message : 'Authentication failed', 'error');
        setTimeout(() => navigate('/login'), 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    void handleAuthCallback();
  }, [navigate, showToast, searchParams]);

  // Handle redirect after profile is loaded
  useEffect(() => {
    if (!loading) {
      if (userProfile) {
        if (isProcessing) {
          // Profile is loaded, redirect based on role
          if (userProfile.role === 'admin' || userProfile.role === 'super_admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard');
          }
        }
      }
    }
  }, [loading, userProfile, isProcessing, navigate]);

  if (!isProcessing) {
    return null; // Component will unmount after navigation
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
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
        Completing authentication...
      </Typography>
    </Box>
  );
};
