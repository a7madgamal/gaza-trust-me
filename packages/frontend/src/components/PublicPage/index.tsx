import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Card, CardContent, Button, Stack, CircularProgress, Link } from '@mui/material';
import {
  WhatsApp,
  LinkedIn,
  Campaign,
  Phone,
  NavigateBefore,
  NavigateNext,
  Facebook,
  Telegram,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { trpc } from '../../utils/trpc';
import { useToast } from '../../hooks/useToast';
import { useMetaTags } from '../../hooks/useMetaTags';
import type { RouterOutputs } from '../../utils/trpc';
import VerificationBadge from '../VerificationBadge';
import SharingWidget from '../SharingWidget';

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

  // Track which users have already had their view count incremented
  const viewCountIncrementedRef = useRef(new Set<string>());

  // Mutation for incrementing view count
  const incrementViewCountMutation = trpc.incrementViewCount.useMutation({
    onError: error => {
      console.error('Failed to increment view count:', error);
    },
  });

  // Generate sharing data with fallbacks
  const currentUser = users[currentUserIndex];
  const shareUrl = currentUser ? `${window.location.origin}/user/${currentUser.url_id}` : '';
  const shareTitle = currentUser ? `${currentUser.full_name} - Verified Help Seeker` : 'GazaTrust.Me';
  const shareDescription = currentUser?.description || 'A verified help seeker on GazaTrust.Me platform.';
  const ogImageUrl = `${window.location.origin}/icon.svg`;

  // Set meta tags for social sharing
  useMetaTags({
    title: shareTitle,
    description: shareDescription,
    url: shareUrl,
    imageUrl: ogImageUrl,
  });

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

      // Clear tracking when users data changes
      viewCountIncrementedRef.current.clear();

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

  // Increment view count on initial page load when urlId is found
  useEffect(() => {
    if (urlId && currentUser?.id && !viewCountIncrementedRef.current.has(currentUser.id)) {
      viewCountIncrementedRef.current.add(currentUser.id);
      incrementViewCountMutation.mutate({ userId: currentUser.id });
    }
  }, [urlId, currentUser?.id, incrementViewCountMutation]);

  const handleNext = () => {
    if (currentUserIndex < users.length - 1) {
      const nextIndex = currentUserIndex + 1;
      const nextUser = users[nextIndex];
      setCurrentUserIndex(nextIndex);
      navigate(`/user/${nextUser.url_id}`, { replace: true });
      // Increment view count for the new user only if not already incremented
      if (!viewCountIncrementedRef.current.has(nextUser.id)) {
        viewCountIncrementedRef.current.add(nextUser.id);
        incrementViewCountMutation.mutate({ userId: nextUser.id });
      }
    }
  };

  const handlePrevious = () => {
    if (currentUserIndex > 0) {
      const prevIndex = currentUserIndex - 1;
      const prevUser = users[prevIndex];
      setCurrentUserIndex(prevIndex);
      navigate(`/user/${prevUser.url_id}`, { replace: true });
      // Increment view count for the new user only if not already incremented
      if (!viewCountIncrementedRef.current.has(prevUser.id)) {
        viewCountIncrementedRef.current.add(prevUser.id);
        incrementViewCountMutation.mutate({ userId: prevUser.id });
      }
    }
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

  return (
    <>
      <Box
        sx={{
          maxWidth: { xs: '100%', sm: 600, md: 800 },
          mx: 'auto',
          p: { xs: 1, sm: 2, md: 3 },
          pb: { xs: 8, sm: 10 }, // Bottom padding only for small screens with fixed sharing widget
        }}
      >
        {/* Card Stack with Sharing Widget */}
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1, sm: 2 },
            alignItems: 'flex-start',
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* Main Card */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <Box position="relative" mb={{ xs: 1, sm: 2, md: 4 }}>
              {/* Main Card */}
              <Card
                elevation={8}
                data-testid="user-card"
                sx={{
                  height: { xs: '65vh', sm: 400, md: 500 },
                  position: 'relative',
                  width: '100%',
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
                <CardContent
                  sx={{
                    p: { xs: 2, sm: 3, md: 4 },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  {/* User Name with Badge */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      alignItems: { xs: 'flex-start', md: 'center' },
                      gap: { xs: 0.5, md: 1 },
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{
                        fontSize: { xs: '1.5rem', md: '2.125rem' },
                        lineHeight: { xs: 1.2, md: 1.4 },
                      }}
                    >
                      {currentUser.full_name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'center' } }}>
                      <VerificationBadge verifiedBy={currentUser.verified_by} status={currentUser.status} />
                    </Box>
                  </Box>

                  {/* Description */}
                  <Box flex={1} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <Box
                      sx={{
                        flex: 1,
                        overflowY: 'auto',
                        maxHeight: { xs: '180px', sm: '220px', md: '280px' },
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
                    {/* Join Date, View Count and Phone */}
                    <Box mb={2}>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)" mb={1}>
                        Joined: {currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)" mb={1}>
                        Views: {currentUser.view_count || 0}
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
                            LinkedIn
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
                            Campaign
                          </Link>
                        )}

                        {/* Facebook Profile */}
                        {currentUser.facebook_url && (
                          <Link
                            href={currentUser.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              color: '#ffffff',
                              textDecoration: 'none',
                              backgroundColor: '#1877f2',
                              px: 1.5,
                              py: 0.75,
                              borderRadius: 1.5,
                              fontSize: '0.8rem',
                              fontWeight: 'medium',
                              border: '1px solid #1877f2',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              '&:hover': {
                                backgroundColor: '#0d5aa7',
                                borderColor: '#0d5aa7',
                                textDecoration: 'none',
                                transform: 'translateY(-1px)',
                              },
                              transition: 'all 0.2s ease-in-out',
                            }}
                          >
                            <Facebook sx={{ fontSize: '1rem' }} />
                            Facebook
                          </Link>
                        )}

                        {/* Telegram Profile */}
                        {currentUser.telegram_url && (
                          <Link
                            href={currentUser.telegram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              color: '#ffffff',
                              textDecoration: 'none',
                              backgroundColor: '#0088cc',
                              px: 1.5,
                              py: 0.75,
                              borderRadius: 1.5,
                              fontSize: '0.8rem',
                              fontWeight: 'medium',
                              border: '1px solid #0088cc',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              '&:hover': {
                                backgroundColor: '#006699',
                                borderColor: '#006699',
                                textDecoration: 'none',
                                transform: 'translateY(-1px)',
                              },
                              transition: 'all 0.2s ease-in-out',
                            }}
                          >
                            <Telegram sx={{ fontSize: '1rem' }} />
                            Telegram
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
          </Box>

          {/* Sharing Widget - Responsive positioning */}
          {currentUser && (
            <>
              {/* Fixed at bottom on small screens */}
              <Box
                sx={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                  p: { xs: 1, sm: 2 },
                  display: { xs: 'flex', md: 'none' },
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <SharingWidget url={shareUrl} title={shareTitle} description={shareDescription} />
              </Box>

              {/* Next to card on larger screens */}
              <Box
                sx={{
                  flexShrink: 0,
                  width: 'auto',
                  display: { xs: 'none', md: 'block' },
                }}
              >
                <SharingWidget url={shareUrl} title={shareTitle} description={shareDescription} />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default PublicPage;
