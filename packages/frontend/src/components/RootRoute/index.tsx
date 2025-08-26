import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import PublicPage from '../PublicPage';

export const RootRoute: React.FC = () => {
  const { user, userProfile, loading } = useAuth();

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 64px)',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // If user is not authenticated, show the public page
  if (!user) {
    return <PublicPage />;
  }

  // If user is authenticated but profile is still loading, show loading
  if (!userProfile) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 64px)',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // If user is admin or super admin, redirect to admin dashboard
  if (userProfile.role === 'admin' || userProfile.role === 'super_admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If user is a regular help seeker, redirect to their dashboard
  return <Navigate to="/dashboard" replace />;
};
