import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { Box, CircularProgress, Typography } from '@mui/material';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  type: string;
}

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login, setUser } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get tokens from URL hash
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const tokens: AuthTokens = {
          access_token: params.get('access_token') || '',
          refresh_token: params.get('refresh_token') || '',
          expires_in: parseInt(params.get('expires_in') || '0'),
          expires_at: parseInt(params.get('expires_at') || '0'),
          token_type: params.get('token_type') || '',
          type: params.get('type') || '',
        };

        // Validate required tokens
        if (!tokens.access_token || !tokens.refresh_token) {
          throw new Error('Missing authentication tokens');
        }

        // Validate token expiration
        const now = Math.floor(Date.now() / 1000);
        if (tokens.expires_at && tokens.expires_at < now) {
          throw new Error('Authentication tokens have expired');
        }

        // Store tokens securely
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        localStorage.setItem('expires_at', tokens.expires_at.toString());
        localStorage.setItem('token_type', tokens.token_type);

        // Get user info from the token (decode JWT)
        const userInfo = decodeJWT(tokens.access_token);
        if (userInfo) {
          localStorage.setItem('user', JSON.stringify(userInfo));
          // Set user directly instead of calling login
          setUser(userInfo);
        }

        // Show success message
        showToast(
          tokens.type === 'signup'
            ? 'Account created successfully! Welcome to Gazaconfirm.'
            : 'Login successful! Welcome back.',
          'success'
        );

        // Clear URL hash and redirect
        window.location.hash = '';
        navigate('/');
      } catch (error) {
        console.error('Auth callback error:', error);
        showToast(error instanceof Error ? error.message : 'Authentication failed', 'error');
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, showToast, login, setUser]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Validating authentication...
      </Typography>
    </Box>
  );
};

// Helper function to decode JWT token
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};
