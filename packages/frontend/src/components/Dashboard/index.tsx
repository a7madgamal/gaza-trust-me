import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const StatusChip = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'PENDING VERIFICATION',
          color: 'warning' as const,
          bgColor: '#fff3cd',
          textColor: '#856404',
          description: 'Your account is being reviewed by our team',
        };
      case 'verified':
        return {
          label: 'VERIFIED',
          color: 'success' as const,
          bgColor: '#d4edda',
          textColor: '#155724',
          description: 'Your account has been verified and approved',
        };
      case 'flagged':
        return {
          label: 'FLAGGED',
          color: 'error' as const,
          bgColor: '#f8d7da',
          textColor: '#721c24',
          description: 'Your account has been flagged for review',
        };
      default:
        return {
          label: 'UNKNOWN',
          color: 'default' as const,
          bgColor: '#f8f9fa',
          textColor: '#6c757d',
          description: 'Status unknown',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Box
      sx={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        padding: 3,
        borderRadius: 2,
        textAlign: 'center',
        border: `2px solid ${config.textColor}`,
        mb: 3,
      }}
    >
      <Typography
        variant="h4"
        component="div"
        sx={{
          fontWeight: 'bold',
          mb: 1,
          textTransform: 'uppercase',
        }}
      >
        {config.label}
      </Typography>
      <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
        {config.description}
      </Typography>
    </Box>
  );
};

const Dashboard = () => {
  const { user, userProfile, loading } = useAuth();
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for dashboard data
    const timer = setTimeout(() => {
      setDashboardLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading || dashboardLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom data-testid="dashboard-title">
        Dashboard
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome back, {user?.email}! Here's your current status.
      </Typography>

      {/* Status Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Account Status
        </Typography>

        {userProfile ? (
          <StatusChip status={userProfile.status} />
        ) : (
          <Alert severity="warning">Unable to load your account status. Please refresh the page.</Alert>
        )}

        {userProfile?.status === 'pending' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Our team is reviewing your submission. This usually takes 1-2 business days. You'll receive an email
              notification once your account is verified.
            </Typography>
          </Alert>
        )}

        {userProfile?.status === 'flagged' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Your account has been flagged for additional review. Please contact support if you believe this is an
              error or if you need assistance.
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Quick Stats - Only show if verified */}
      {userProfile?.status === 'verified' && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Profile Status
                </Typography>
                <Typography variant="h4" component="div">
                  0
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Pending Review
                </Typography>
                <Typography variant="h4" component="div">
                  0
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Approved
                </Typography>
                <Typography variant="h4" component="div">
                  0
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Rejected
                </Typography>
                <Typography variant="h4" component="div">
                  0
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Quick Actions */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button variant="outlined" component={RouterLink} to="/profile">
              Edit Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Recent Cases - Only show if verified */}
      {userProfile?.status === 'verified' && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h6">Profile Management</Typography>
            <Button variant="outlined" component={RouterLink} to="/profile">
              View Profile
            </Button>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            Your profile is verified and ready to connect with others.
            <Button component={RouterLink} to="/profile" sx={{ ml: 1 }}>
              Manage Profile
            </Button>
          </Alert>
        </Paper>
      )}

      {/* Coming Soon Notice */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>Coming Soon:</strong> Profile image uploads and enhanced profile management features are currently
          being developed. You'll be able to upload profile images and enhance your profile information.
        </Typography>
      </Alert>
    </Container>
  );
};

export default Dashboard;
