import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Avatar,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const Profile = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Profile data is now available through useAuth context
    setLoading(false);
  }, []);

  const getStatusColor = (status: string): 'warning' | 'success' | 'error' | 'default' => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'verified':
        return 'success';
      case 'flagged':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Verification';
      case 'verified':
        return 'Verified';
      case 'flagged':
        return 'Flagged';
      default:
        return status;
    }
  };

  if (loading) {
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

  if (!userProfile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Failed to load profile data</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
        <Grid container spacing={4}>
          {/* Avatar Section */}
          <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                fontSize: '3rem',
                bgcolor: 'primary.main',
                mx: 'auto',
                mb: 2,
              }}
            >
              {userProfile.full_name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6" gutterBottom data-testid="profile-fullName">
              {userProfile.full_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" data-testid="profile-role">
              {userProfile.role.replace('_', ' ').toUpperCase()}
            </Typography>

            {/* Status Chip */}
            <Box sx={{ mt: 2 }}>
              <Chip
                label={getStatusLabel(userProfile.status)}
                color={getStatusColor(userProfile.status)}
                size="medium"
                data-testid="profile-status"
              />
            </Box>
          </Grid>

          {/* Profile Details */}
          <Grid item xs={12} md={9}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={userProfile.email}
                  disabled
                  helperText="Email cannot be changed"
                  inputProps={{ 'data-testid': 'profile-email' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Role"
                  value={userProfile.role.replace('_', ' ').toUpperCase()}
                  disabled
                  helperText="Role is managed by administrators"
                  inputProps={{ 'data-testid': 'profile-role-display' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={userProfile.full_name}
                  disabled
                  inputProps={{ 'data-testid': 'profile-fullName-input' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={userProfile.phone_number || ''}
                  disabled
                  inputProps={{ 'data-testid': 'profile-phoneNumber-input' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={userProfile.description}
                  multiline
                  rows={4}
                  disabled
                  inputProps={{ 'data-testid': 'profile-description' }}
                />
              </Grid>
              {userProfile.verifiedAt && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Verified At"
                    value={new Date(userProfile.verifiedAt).toLocaleDateString()}
                    disabled
                    inputProps={{ 'data-testid': 'profile-verified-at' }}
                  />
                </Grid>
              )}
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Alert severity="info">
                Profile information is collected during registration and cannot be edited. Contact support if you need
                to update your information.
              </Alert>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile;
