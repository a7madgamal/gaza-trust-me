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
  Button,
} from '@mui/material';
import { LinkedIn, Campaign, Launch } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const Profile = () => {
  const { userProfile, loading } = useAuth();

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
  } else if (!userProfile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Failed to load profile data</Alert>
      </Container>
    );
  } else {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            background: 'linear-gradient(135deg, #d32f2f 0%, #4caf50 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
          }}
        >
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
                  background: 'linear-gradient(135deg, #d32f2f 0%, #4caf50 100%)',
                  mx: 'auto',
                  mb: 2,
                  boxShadow: '0 4px 20px rgba(211, 47, 47, 0.3), 0 2px 6px rgba(0, 0, 0, 0.1)',
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="LinkedIn Profile URL"
                    value={userProfile.linkedin_url || 'Not provided'}
                    disabled
                    inputProps={{ 'data-testid': 'profile-linkedin-url' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Campaign/Fundraising URL"
                    value={userProfile.campaign_url || 'Not provided'}
                    disabled
                    inputProps={{ 'data-testid': 'profile-campaign-url' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Public Profile ID"
                    value={userProfile.url_id || 'Not assigned'}
                    disabled
                    helperText="Your unique public profile identifier"
                    inputProps={{ 'data-testid': 'profile-url-id' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account Created"
                    value={userProfile.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Unknown'}
                    disabled
                    inputProps={{ 'data-testid': 'profile-created-at' }}
                  />
                </Grid>
                {userProfile.updated_at && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Updated"
                      value={new Date(userProfile.updated_at).toLocaleDateString()}
                      disabled
                      inputProps={{ 'data-testid': 'profile-updated-at' }}
                    />
                  </Grid>
                )}
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

              {/* Links Section */}
              {(userProfile.linkedin_url || userProfile.campaign_url) && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    External Links
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={2}>
                    {userProfile.linkedin_url && (
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="outlined"
                          startIcon={<LinkedIn />}
                          endIcon={<Launch />}
                          href={userProfile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          fullWidth
                          sx={{
                            borderColor: '#0077b5',
                            color: '#0077b5',
                            '&:hover': {
                              borderColor: '#005885',
                              backgroundColor: 'rgba(0, 119, 181, 0.08)',
                            },
                          }}
                          data-testid="profile-linkedin-button"
                        >
                          View LinkedIn Profile
                        </Button>
                      </Grid>
                    )}
                    {userProfile.campaign_url && (
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="outlined"
                          startIcon={<Campaign />}
                          endIcon={<Launch />}
                          href={userProfile.campaign_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          fullWidth
                          sx={{
                            borderColor: '#4caf50',
                            color: '#4caf50',
                            '&:hover': {
                              borderColor: '#2e7d32',
                              backgroundColor: 'rgba(76, 175, 80, 0.08)',
                            },
                          }}
                          data-testid="profile-campaign-button"
                        >
                          View Campaign
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {/* Public Profile Link */}
              {userProfile.url_id && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Public Profile
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <Button
                    variant="contained"
                    startIcon={<Launch />}
                    href={`/user/${userProfile.url_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      background: 'linear-gradient(135deg, #d32f2f 0%, #4caf50 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #b71c1c 0%, #2e7d32 100%)',
                      },
                    }}
                    data-testid="profile-public-link"
                  >
                    View Public Profile
                  </Button>
                </Box>
              )}

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
  }
};

export default Profile;
