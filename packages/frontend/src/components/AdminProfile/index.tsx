import React from 'react';
import { Box, Typography, Card, CardContent, Chip, CircularProgress, Alert, Divider, Link } from '@mui/material';
import {
  Verified,
  AdminPanelSettings,
  SupervisedUserCircle,
  Email,
  Phone,
  LinkedIn,
  Language,
  CalendarToday,
  Update,
  Twitter,
  Facebook,
  Instagram,
  Public,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { trpc } from '../../utils/trpc';

const AdminProfile: React.FC = () => {
  const { adminId } = useParams<{ adminId: string }>();

  const {
    data: adminData,
    isLoading,
    error,
  } = trpc.getAdminProfile.useQuery(
    { adminId: adminId || null },
    {
      enabled: !!adminId,
    }
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load admin profile: {error.message}</Alert>
      </Box>
    );
  }

  if (!adminData?.data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Admin not found or not accessible.</Alert>
      </Box>
    );
  }

  const admin = adminData.data;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <SupervisedUserCircle />;
      case 'admin':
        return <AdminPanelSettings />;
      default:
        return <AdminPanelSettings />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string): 'error' | 'primary' | 'default' => {
    switch (role) {
      case 'super_admin':
        return 'error';
      case 'admin':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Admin Profile
      </Typography>

      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Admin Name and Role */}
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Typography variant="h5" fontWeight="bold">
              {admin.full_name}
            </Typography>
            <Chip
              icon={getRoleIcon(admin.role)}
              label={getRoleLabel(admin.role)}
              color={getRoleColor(admin.role)}
              size="medium"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          {/* Verification Stats */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Verification Activity
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Chip
                icon={<Verified />}
                label={`${admin.verification_count} profiles verified`}
                color="success"
                size="medium"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </Box>

          {/* Admin Info */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Admin Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email color="action" />
                <Typography variant="body1">
                  <strong>Email:</strong> {admin.email}
                </Typography>
              </Box>

              {admin.phone_number && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone color="action" />
                  <Typography variant="body1">
                    <strong>Phone:</strong> {admin.phone_number}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday color="action" />
                <Typography variant="body1">
                  <strong>Member since:</strong>{' '}
                  {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>

              {admin.updated_at && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Update color="action" />
                  <Typography variant="body1">
                    <strong>Last updated:</strong> {new Date(admin.updated_at).toLocaleDateString()}
                  </Typography>
                </Box>
              )}

              <Typography variant="body1">
                <strong>Admin ID:</strong> {admin.id}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Description */}
      {admin.description && (
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              About This Admin
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {admin.description}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Contact & Links */}
      {(admin.linkedin_url || admin.campaign_url) && (
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Contact & Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {admin.linkedin_url && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinkedIn color="primary" />
                  <Link href={admin.linkedin_url} target="_blank" rel="noopener noreferrer">
                    LinkedIn Profile
                  </Link>
                </Box>
              )}

              {admin.campaign_url && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Language color="primary" />
                  <Link href={admin.campaign_url} target="_blank" rel="noopener noreferrer">
                    Campaign Page
                  </Link>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Verification Summary */}
      <Card elevation={2}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Verification Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This admin has verified {admin.verification_count} help seeker profiles on our platform. All verifications
            are performed with care to ensure the authenticity and legitimacy of each profile.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminProfile;
