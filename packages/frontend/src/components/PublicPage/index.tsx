import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, Stack, Chip, CircularProgress, Link } from '@mui/material';
import {
  WhatsApp,
  LinkedIn,
  Campaign,
  Phone,
  Verified,
  NavigateBefore,
  NavigateNext,
  Check,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
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
  const { urlId } = useParams<{ urlId: string }>();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (usersData) {
      setUsers(usersData);
      setLoading(false);

      // If we have a urlId, find the matching user and set the index
      if (urlId) {
        const userIndex = usersData.findIndex(user => user.url_id === parseInt(urlId, 10));
        if (userIndex !== -1) {
          setCurrentUserIndex(userIndex);
        }
      }
    }
  }, [usersData, urlId]);

  // Handle errors
  useEffect(() => {
    if (usersError) {
      showToast('Failed to load users: ' + usersError.message, 'error');
      setLoading(false);
    }
  }, [usersError, showToast]);

  // Navigate to first user when component loads (only when not already on a specific user URL)
  useEffect(() => {
    if (!urlId && users.length > 0 && users[0]?.url_id) {
      navigate(`/user/${users[0].url_id}`, { replace: true });
    }
  }, [urlId, users, navigate]);

  const handleNext = () => {
    if (currentUserIndex < users.length - 1) {
      const nextIndex = currentUserIndex + 1;
      const nextUser = users[nextIndex];
      setCurrentUserIndex(nextIndex);
      navigate(`/user/${nextUser.url_id}`, { replace: true });
    }
  };

  const handlePrevious = () => {
    if (currentUserIndex > 0) {
      const prevIndex = currentUserIndex - 1;
      const prevUser = users[prevIndex];
      setCurrentUserIndex(prevIndex);
      navigate(`/user/${prevUser.url_id}`, { replace: true });
    }
  };

  const handleAccept = () => {
    // TODO: Implement accept functionality
    console.log('Accept user:', users[currentUserIndex]);
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
      <Box
        textAlign="center"
        mb={4}
        sx={{
          background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.05) 0%, rgba(76, 175, 80, 0.05) 100%)',
          borderRadius: 0,
          p: 4,
          border: '1px solid rgba(211, 47, 47, 0.1)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            background: 'linear-gradient(135deg, #d32f2f 0%, #4caf50 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
          }}
        >
          Confirmed from Gaza
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          Browse verified users who need help
        </Typography>
      </Box>

      {/* Card Stack */}
      <Box position="relative" mb={4}>
        {/* Progress indicator */}
        <Box display="flex" justifyContent="center" mb={2} data-testid="progress-indicator">
          <Typography variant="body2" color="text.secondary">
            {currentUserIndex + 1} of {users.length}
          </Typography>
        </Box>

        {/* Main Card */}
        <Card
          elevation={8}
          data-testid="user-card"
          sx={{
            height: 500,
            position: 'relative',
            background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 50%, #8e0000 100%)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
              borderRadius: 'inherit',
              pointerEvents: 'none',
            },
          }}
        >
          <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* User Name with Badge */}
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Typography variant="h4" fontWeight="bold">
                {currentUser.full_name}
              </Typography>
              <Chip
                icon={currentUser.status === 'verified' ? <Verified sx={{ color: 'white !important' }} /> : undefined}
                label={currentUser.status === 'verified' ? 'Verified' : currentUser.status}
                color={currentUser.status === 'verified' ? 'success' : 'default'}
                size="small"
                sx={{
                  backgroundColor:
                    currentUser.status === 'verified' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontWeight: 'bold',
                  '& .MuiChip-icon': {
                    color: 'white',
                  },
                }}
              />
            </Box>

            {/* Description */}
            <Box flex={1} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Typography variant="h6" gutterBottom>
                Needs Help With:
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  maxHeight: '200px',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(255,255,255,0.3)',
                    borderRadius: '3px',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.5)',
                    },
                  },
                }}
              >
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {currentUser.description || 'No description provided.'}
                </Typography>
              </Box>
            </Box>

            {/* Details Section - All info below the line */}
            <Box
              sx={{
                mt: 'auto',
                pt: 2,
                borderTop: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              {/* Join Date and Phone */}
              <Box mb={2}>
                <Typography variant="body2" color="rgba(255,255,255,0.8)" mb={1}>
                  Joined: {currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'N/A'}
                </Typography>
                {currentUser.phone_number && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Phone sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)' }} />
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      {currentUser.phone_number}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Links Section */}
              {(currentUser.phone_number || currentUser.linkedin_url || currentUser.campaign_url) && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {/* WhatsApp Link */}
                  {currentUser.phone_number && (
                    <Link
                      href={createWhatsAppLink(currentUser.phone_number)}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: '#ffffff',
                        textDecoration: 'none',
                        backgroundColor: '#25D366',
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 1.5,
                        fontSize: '0.8rem',
                        fontWeight: 'medium',
                        border: '1px solid #25D366',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        '&:hover': {
                          backgroundColor: '#128C7E',
                          borderColor: '#128C7E',
                          textDecoration: 'none',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <WhatsApp sx={{ fontSize: '1rem' }} />
                      WhatsApp
                    </Link>
                  )}

                  {/* LinkedIn Profile */}
                  {currentUser.linkedin_url && (
                    <Link
                      href={currentUser.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: '#ffffff',
                        textDecoration: 'none',
                        backgroundColor: '#0077b5',
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 1.5,
                        fontSize: '0.8rem',
                        fontWeight: 'medium',
                        border: '1px solid #0077b5',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        '&:hover': {
                          backgroundColor: '#005885',
                          borderColor: '#005885',
                          textDecoration: 'none',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <LinkedIn sx={{ fontSize: '1rem' }} />
                      LinkedIn Profile
                    </Link>
                  )}

                  {/* Campaign/Fundraising Link */}
                  {currentUser.campaign_url && (
                    <Link
                      href={currentUser.campaign_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'rgba(255,255,255,0.9)',
                        textDecoration: 'none',
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 1.5,
                        fontSize: '0.8rem',
                        fontWeight: 'medium',
                        border: '1px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.25)',
                          textDecoration: 'none',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <Campaign sx={{ fontSize: '1rem' }} />
                      Campaign/Fundraising
                    </Link>
                  )}
                </Stack>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
          <Button
            variant="outlined"
            onClick={handlePrevious}
            disabled={currentUserIndex === 0}
            startIcon={<NavigateBefore />}
            sx={{
              minWidth: 120,
              borderColor: '#4caf50',
              color: '#4caf50',
              '&:hover': {
                borderColor: '#2e7d32',
                backgroundColor: 'rgba(76, 175, 80, 0.08)',
              },
            }}
          >
            Previous
          </Button>

          <Button
            variant="contained"
            onClick={handleAccept}
            startIcon={<Check />}
            sx={{
              minWidth: 120,
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
              },
            }}
          >
            I contacted
          </Button>

          <Button
            variant="outlined"
            onClick={handleNext}
            disabled={currentUserIndex === users.length - 1}
            endIcon={<NavigateNext />}
            sx={{
              minWidth: 120,
              borderColor: '#4caf50',
              color: '#4caf50',
              '&:hover': {
                borderColor: '#2e7d32',
                backgroundColor: 'rgba(76, 175, 80, 0.08)',
              },
            }}
          >
            Next
          </Button>
        </Stack>
      </Box>

      {/* Instructions */}
      <Box textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Click "I contacted" when you've reached out to help this person
        </Typography>
      </Box>
    </Box>
  );
};

export default PublicPage;
