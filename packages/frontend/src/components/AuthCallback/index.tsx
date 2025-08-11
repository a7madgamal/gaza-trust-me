import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { Box, CircularProgress, Typography } from '@mui/material';
import { supabase } from '../../lib/supabase';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback from Supabase
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
          setTimeout(() => navigate('/dashboard'), 2000);
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

    handleAuthCallback();
  }, [navigate, showToast]);

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
