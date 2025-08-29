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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { LinkedIn, Campaign, Launch, Edit, Save, Cancel, Warning } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';
import { trpc } from '../../utils/trpc';
import { useToast } from '../../hooks/useToast';

const Profile = () => {
  const { userProfile, loading, refetchProfile } = useAuth();
  const { showToast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    description: '',
    linkedin_url: '',
    campaign_url: '',
  });

  const updateProfileMutation = trpc.updateProfile.useMutation({
    onSuccess: data => {
      if (data.success) {
        showToast('Profile updated successfully! Your profile will need to be verified again.', 'success');
        setIsEditMode(false);
        if (refetchProfile) {
          void refetchProfile();
        }
      } else {
        showToast(data.error || 'Failed to update profile', 'error');
      }
    },
    onError: error => {
      showToast(error.message || 'Failed to update profile', 'error');
    },
  });

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

  const handleEditClick = () => {
    // Super admins don't need the warning since they have elevated privileges
    if (userProfile?.status === 'verified' && userProfile?.role !== 'super_admin') {
      setShowWarningDialog(true);
    } else {
      startEditMode();
    }
  };

  const startEditMode = () => {
    setFormData({
      full_name: userProfile?.full_name || '',
      phone_number: userProfile?.phone_number || '',
      description: userProfile?.description || '',
      linkedin_url: userProfile?.linkedin_url || '',
      campaign_url: userProfile?.campaign_url || '',
    });
    setIsEditMode(true);
    setShowWarningDialog(false);
  };

  const handleSave = () => {
    const updateData: {
      full_name?: string;
      phone_number?: string;
      description?: string;
      linkedin_url?: string;
      campaign_url?: string;
    } = {};

    // Only include fields that have changed
    if (formData.full_name !== userProfile?.full_name) {
      updateData.full_name = formData.full_name;
    }
    if (formData.phone_number !== userProfile?.phone_number) {
      updateData.phone_number = formData.phone_number;
    }
    if (formData.description !== userProfile?.description) {
      updateData.description = formData.description;
    }
    if (formData.linkedin_url !== userProfile?.linkedin_url) {
      updateData.linkedin_url = formData.linkedin_url || undefined;
    }
    if (formData.campaign_url !== userProfile?.campaign_url) {
      updateData.campaign_url = formData.campaign_url || undefined;
    }

    if (Object.keys(updateData).length === 0) {
      showToast('No changes to save', 'info');
      setIsEditMode(false);
      return;
    }

    updateProfileMutation.mutate(updateData);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setShowWarningDialog(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
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
        <CircularProgress size={60} role="progressbar" />
      </Box>
    );
  } else if (!loading && !userProfile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Failed to load profile data</Alert>
      </Container>
    );
  } else if (userProfile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            component="h1"
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

          {!isEditMode && (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={handleEditClick}
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)',
                },
              }}
              data-testid="profile-edit-button"
            >
              Edit Profile
            </Button>
          )}
        </Box>

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

              {/* Status Chip - Only show for help seekers */}
              <Box sx={{ mt: 2 }}>
                {userProfile.role === 'help_seeker' && (
                  <Chip
                    label={getStatusLabel(userProfile.status)}
                    color={getStatusColor(userProfile.status)}
                    size="medium"
                    data-testid="profile-status"
                  />
                )}
              </Box>
            </Grid>

            {/* Profile Details */}
            <Grid item xs={12} md={9}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Profile Information</Typography>
                {isEditMode && (
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      sx={{ mr: 1 }}
                      data-testid="profile-cancel-button"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                      disabled={updateProfileMutation.isLoading}
                      sx={{
                        background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #388e3c 0%, #43a047 100%)',
                        },
                      }}
                      data-testid="profile-save-button"
                    >
                      {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                )}
              </Box>
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
                    value={isEditMode ? formData.full_name : userProfile.full_name}
                    onChange={e => handleInputChange('full_name', e.target.value)}
                    disabled={!isEditMode}
                    inputProps={{ 'data-testid': 'profile-fullName-input' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={isEditMode ? formData.phone_number : userProfile.phone_number || 'Not provided'}
                    onChange={e => handleInputChange('phone_number', e.target.value)}
                    disabled={!isEditMode}
                    inputProps={{ 'data-testid': 'profile-phoneNumber-input' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={isEditMode ? formData.description : userProfile.description || 'Not provided'}
                    onChange={e => handleInputChange('description', e.target.value)}
                    multiline
                    rows={4}
                    disabled={!isEditMode}
                    inputProps={{ 'data-testid': 'profile-description' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="LinkedIn Profile URL"
                    value={isEditMode ? formData.linkedin_url : userProfile.linkedin_url || 'Not provided'}
                    onChange={e => handleInputChange('linkedin_url', e.target.value)}
                    disabled={!isEditMode}
                    placeholder="https://linkedin.com/in/yourprofile"
                    inputProps={{ 'data-testid': 'profile-linkedin-url' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Campaign/Fundraising URL"
                    value={isEditMode ? formData.campaign_url : userProfile.campaign_url || 'Not provided'}
                    onChange={e => handleInputChange('campaign_url', e.target.value)}
                    disabled={!isEditMode}
                    placeholder="https://your-campaign-url.com"
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
                          component="a"
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
                          component="a"
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
                    component="a"
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

              {!isEditMode && (
                <Box sx={{ mt: 4 }}>
                  <Alert severity="info">
                    Profile information is collected during registration and cannot be edited. Contact support if you
                    need to update your information.
                  </Alert>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Warning Dialog for Verified Users */}
        <Dialog open={showWarningDialog} onClose={() => setShowWarningDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" />
            Verification Reset Warning
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Editing your profile will reset your verification status to "Pending" and you will need to be verified
              again by an administrator. This ensures the accuracy of your updated information.
            </DialogContentText>
            <DialogContentText sx={{ mt: 2, fontWeight: 'bold' }}>Are you sure you want to continue?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowWarningDialog(false)} data-testid="warning-dialog-cancel">
              Cancel
            </Button>
            <Button onClick={startEditMode} variant="contained" color="warning" data-testid="warning-dialog-continue">
              Continue Editing
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }
};

export default Profile;
