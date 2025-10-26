import React, { useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import { Box, Typography, Card, CardContent, Button, Stack, CircularProgress, Link, Fade } from '@mui/material';
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
import { useAuth } from '../../contexts/AuthContextDef';
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

type User = RouterOutputs['getUserData'];

const PublicPage: React.FC = () => {
  const { urlId } = useParams<{ urlId: string }>();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<User[]>([]);
  const { showToast } = useToast();
  const { user: currentLoggedInUser } = useAuth();

  // Track which users have already had their view count incremented
  const viewCountIncrementedRef = useRef(new Set<string>());
  // Track if we're navigating back (to prevent clearing history)
  const isNavigatingBackRef = useRef(false);

  // Mutation for incrementing view count
  const incrementViewCountMutation = trpc.incrementViewCount.useMutation({
    onError: error => {
      console.error('Failed to increment view count:', error);
    },
  });

  // Set meta tags for social sharing
  useMetaTags({
    title: currentUser ? `${currentUser.full_name} - Verified Help Seeker` : '',
    description: currentUser?.description || '',
    url: currentUser ? `${window.location.origin}/user/${currentUser.url_id}` : '',
    imageUrl: `${window.location.origin}/icon.svg`,
  });

  // Single source of truth: URL
  const urlIdNumber = urlId ? parseInt(urlId, 10) : 0;

  // Single query for all user data (includes navigation info)
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = trpc.getUserData.useQuery(
    { urlId: urlIdNumber },
    {
      enabled: !!urlId && urlIdNumber > 0,
    }
  );

  // Fallback for homepage (no URL ID) - get first user
  const {
    data: firstUserData,
    isLoading: firstUserLoading,
    error: firstUserError,
  } = trpc.getNextUser.useQuery(
    { direction: 'next' },
    {
      enabled: !urlId,
    }
  );

  // Handle user data updates - simplified logic for better refresh handling
  useEffect(() => {
    if (userData) {
      // Always update current user when we get new data
      setCurrentUser(userData);
      setLoading(false);
    } else if (userData === null && !userLoading) {
      // User not found or no users available
      setCurrentUser(null);
      setLoading(false);
    }
  }, [userData, userLoading]);

  // Handle first user data for homepage
  useEffect(() => {
    if (firstUserData && !urlId) {
      // Navigate to first user's URL
      navigate(`/user/${firstUserData.url_id}`, { replace: true });
      setNavigationHistory([]);
    }
  }, [firstUserData, urlId, navigate]);

  // Handle errors
  useEffect(() => {
    if (userError) {
      showToast('Failed to load user: ' + userError.message, 'error');
      setLoading(false);
    } else if (firstUserError) {
      showToast('Failed to load users: ' + firstUserError.message, 'error');
      setLoading(false);
    }
  }, [userError, firstUserError, showToast]);

  // Increment view count on initial page load when user is found (only for anonymous users)
  useEffect(() => {
    if (currentUser?.id && !currentLoggedInUser && !viewCountIncrementedRef.current.has(currentUser.id)) {
      viewCountIncrementedRef.current.add(currentUser.id);
      incrementViewCountMutation.mutate({ userId: currentUser.id });
    }
  }, [currentUser?.id, currentLoggedInUser, incrementViewCountMutation]);

  const handleNext = () => {
    console.log('🚀 handleNext called:', { currentUser: currentUser?.id, isNavigating });

    if (currentUser && !isNavigating && currentUser.nextUserUrlId) {
      setIsNavigating(true);

      // Add current user to history before navigating
      setNavigationHistory(prev => [...prev, currentUser]);

      console.log('🔄 Navigating to next user:', currentUser.nextUserUrlId);

      // Navigate directly using the nextUserUrlId from the current user data
      navigate(`/user/${currentUser.nextUserUrlId}`, { replace: true });

      // Increment view count (only for anonymous users)
      if (!currentLoggedInUser && !viewCountIncrementedRef.current.has(currentUser.id)) {
        viewCountIncrementedRef.current.add(currentUser.id);
        incrementViewCountMutation.mutate({ userId: currentUser.id });
      }

      // Reset navigation state immediately to prevent multiple clicks
      setIsNavigating(false);
    } else if (currentUser && !currentUser.nextUserUrlId) {
      console.log('❌ No more users available');
      showToast('No more users available', 'info');
    }
  };

  const handlePrevious = () => {
    if (!isNavigating && navigationHistory.length > 0) {
      setIsNavigating(true);
      isNavigatingBackRef.current = true;

      // Get the last user from history
      const previousUser = navigationHistory[navigationHistory.length - 1];
      if (!previousUser) return;

      // Remove the last user from history
      setNavigationHistory(prev => prev.slice(0, -1));

      // Set the previous user as current and navigate
      setCurrentUser(previousUser);
      navigate(`/user/${previousUser.url_id}`, { replace: true });

      // Reset navigation state
      setTimeout(() => {
        setIsNavigating(false);
        isNavigatingBackRef.current = false;
      }, 100);
    }
  };

  // Determine if we're loading
  const isLoading = loading || (urlId ? userLoading : firstUserLoading) || isNavigating;

  // Only show full-page states when we have no current user and no loading
  if (!currentUser && !isLoading && !userError && !firstUserError) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
        <Typography variant="h4" gutterBottom>
          {urlId ? 'User Not Found' : 'No Users Available'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {urlId ? 'The requested user could not be found.' : 'There are currently no verified users to browse.'}
        </Typography>
      </Box>
    );
  }

  if ((userError || firstUserError) && !currentUser) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
        <Typography variant="h4" gutterBottom color="error">
          Error Loading User
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
                {/* Loading Overlay */}
                <Fade in={isLoading} timeout={300}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.8) 100%)',
                      backdropFilter: 'blur(4px)',
                      display: isLoading ? 'flex' : 'none',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10,
                      borderRadius: 'inherit',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <CircularProgress
                        sx={{
                          color: 'rgba(255, 255, 255, 0.9)',
                          '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                          },
                        }}
                        size={40}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontWeight: 500,
                          textAlign: 'center',
                        }}
                      >
                        Loading...
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
                <CardContent
                  sx={{
                    p: { xs: 2, sm: 3, md: 4 },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  {currentUser && (
                    <>
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
                          {currentUser.status === 'verified' &&
                            (() => {
                              try {
                                const VerifiedUserSchema = z.object({
                                  verified_by: z.string(),
                                  verified_by_admin: z.object({ full_name: z.string() }),
                                  status: z.literal('verified'),
                                });
                                const validatedUser = VerifiedUserSchema.parse(currentUser);
                                return (
                                  <VerificationBadge
                                    verifiedBy={validatedUser.verified_by}
                                    verifiedByAdmin={validatedUser.verified_by_admin}
                                    status={validatedUser.status}
                                  />
                                );
                              } catch (error) {
                                console.error('VerificationBadge validation failed:', error);
                                return null;
                              }
                            })()}
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
                            Joined:{' '}
                            {currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="rgba(255,255,255,0.8)" mb={1}>
                            Views: {currentUser.view_count || 0}
                          </Typography>
                          <Typography variant="body2" color="rgba(255,255,255,0.8)" mb={1}>
                            ID: {currentUser.url_id}
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
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
                <Button
                  variant="outlined"
                  onClick={handlePrevious}
                  disabled={isLoading || navigationHistory.length === 0}
                  startIcon={<NavigateBefore />}
                  sx={{
                    minWidth: 120,
                    borderColor: '#4caf50',
                    color: '#4caf50',
                    '&:hover': {
                      borderColor: '#2e7d32',
                      backgroundColor: 'rgba(76, 175, 80, 0.08)',
                    },
                    '&:disabled': {
                      borderColor: 'rgba(76, 175, 80, 0.3)',
                      color: 'rgba(76, 175, 80, 0.3)',
                    },
                  }}
                >
                  Previous
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => void handleNext()}
                  disabled={isLoading}
                  endIcon={<NavigateNext />}
                  sx={{
                    minWidth: 120,
                    borderColor: '#4caf50',
                    color: '#4caf50',
                    '&:hover': {
                      borderColor: '#2e7d32',
                      backgroundColor: 'rgba(76, 175, 80, 0.08)',
                    },
                    '&:disabled': {
                      borderColor: 'rgba(76, 175, 80, 0.3)',
                      color: 'rgba(76, 175, 80, 0.3)',
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
                <SharingWidget
                  url={`${window.location.origin}/user/${currentUser.url_id}`}
                  title={`${currentUser.full_name} - Verified Help Seeker`}
                  description={currentUser.description}
                />
              </Box>

              {/* Next to card on larger screens */}
              <Box
                sx={{
                  flexShrink: 0,
                  width: 'auto',
                  display: { xs: 'none', md: 'block' },
                }}
              >
                <SharingWidget
                  url={`${window.location.origin}/user/${currentUser.url_id}`}
                  title={`${currentUser.full_name} - Verified Help Seeker`}
                  description={currentUser.description}
                />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default PublicPage;
