import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, Stack, Chip, CircularProgress, Link } from '@mui/material';
import { trpc } from '../../utils/trpc';
import { useToast } from '../../hooks/useToast';
import type { RouterOutputs } from '../../utils/trpc';

// Utility function to format phone number for WhatsApp
const formatPhoneForWhatsApp = (phone: string): string => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone;
};

// Utility function to create WhatsApp link
const createWhatsAppLink = (phone: string): string => {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  return `https://wa.me/${formattedPhone}`;
};

type User = RouterOutputs['getUsersForCards'][number];

const PublicPage: React.FC = () => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Fetch users for the card stack
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = trpc.getUsersForCards.useQuery({
    limit: 20,
    offset: 0,
  });

  // Get total count
  const { data: totalCount, error: countError } = trpc.getVerifiedUserCount.useQuery();

  useEffect(() => {
    if (usersData) {
      setUsers(usersData);
      setLoading(false);
    }
  }, [usersData]);

  // Handle errors
  useEffect(() => {
    if (usersError) {
      showToast('Failed to load users: ' + usersError.message, 'error');
      setLoading(false);
    }
    if (countError) {
      showToast('Failed to load user count: ' + countError.message, 'error');
    }
  }, [usersError, countError, showToast]);

  const handleNext = () => {
    if (currentUserIndex < users.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentUserIndex > 0) {
      setCurrentUserIndex(currentUserIndex - 1);
    }
  };

  const handleAccept = () => {
    // TODO: Implement accept functionality
    console.log('Accept user:', users[currentUserIndex]);
    handleNext();
  };

  const handleReject = () => {
    // TODO: Implement reject functionality
    console.log('Reject user:', users[currentUserIndex]);
    handleNext();
  };

  if (loading || usersLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!users.length && !loading && !usersError) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
        <Typography variant="h4" gutterBottom>
          No Users Available
        </Typography>
        <Typography variant="body1" color="text.secondary">
          There are currently no verified users to browse.
        </Typography>
      </Box>
    );
  }

  if (usersError) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
        <Typography variant="h4" gutterBottom color="error">
          Error Loading Users
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please try refreshing the page.
        </Typography>
      </Box>
    );
  }

  const currentUser = users[currentUserIndex];

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" gutterBottom>
          Help Someone Today
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse verified users who need help
        </Typography>
        {totalCount && (
          <Typography variant="body2" color="text.secondary" mt={1}>
            {totalCount} verified users available
          </Typography>
        )}
      </Box>

      {/* Card Stack */}
      <Box position="relative" mb={4}>
        {/* Progress indicator */}
        <Box display="flex" justifyContent="center" mb={2}>
          <Typography variant="body2" color="text.secondary">
            {currentUserIndex + 1} of {users.length}
          </Typography>
        </Box>

        {/* Main Card */}
        <Card
          elevation={8}
          data-testid="user-card"
          sx={{
            minHeight: 400,
            position: 'relative',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* User Name */}
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {currentUser.full_name}
            </Typography>

            {/* Status Badge */}
            <Box mb={2}>
              <Chip
                label={currentUser.status === 'verified' ? '✅ Verified' : currentUser.status}
                color={currentUser.status === 'verified' ? 'success' : 'default'}
                size="small"
                sx={{
                  backgroundColor:
                    currentUser.status === 'verified' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
            </Box>

            {/* Description */}
            <Box flex={1} mb={3}>
              <Typography variant="h6" gutterBottom>
                Needs Help With:
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {currentUser.description || 'No description provided.'}
              </Typography>
            </Box>

            {/* User Info */}
            <Box>
              <Typography variant="body2" color="rgba(255,255,255,0.8)" mb={1}>
                Joined: {new Date(currentUser.created_at).toLocaleDateString()}
              </Typography>

              {/* Phone Number and WhatsApp */}
              {currentUser.phone_number && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    📞 {currentUser.phone_number}
                  </Typography>
                  <Link
                    href={createWhatsAppLink(currentUser.phone_number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      textDecoration: 'none',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        textDecoration: 'none',
                      },
                    }}
                  >
                    💬 WhatsApp
                  </Link>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
          <Button variant="outlined" onClick={handlePrevious} disabled={currentUserIndex === 0} sx={{ minWidth: 100 }}>
            Previous
          </Button>

          <Button variant="contained" color="success" onClick={handleAccept} sx={{ minWidth: 100 }}>
            Accept
          </Button>

          <Button variant="contained" color="error" onClick={handleReject} sx={{ minWidth: 100 }}>
            Reject
          </Button>

          <Button
            variant="outlined"
            onClick={handleNext}
            disabled={currentUserIndex === users.length - 1}
            sx={{ minWidth: 100 }}
          >
            Next
          </Button>
        </Stack>
      </Box>

      {/* Instructions */}
      <Box textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Click Accept to help this person, or Reject to skip to the next user
        </Typography>
      </Box>
    </Box>
  );
};

export default PublicPage;
