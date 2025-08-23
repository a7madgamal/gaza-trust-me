import { Box, Container, Typography, Button, AppBar, Toolbar, Avatar, Menu, MenuItem, IconButton } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    void logout().then(() => navigate('/'));
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Gazaconfirm
          </Typography>

          {user ? (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/dashboard"
                sx={{ mr: 2 }}
                data-testid="dashboard-link"
              >
                Dashboard
              </Button>
              <Button color="inherit" component={RouterLink} to="/profile" sx={{ mr: 2 }} data-testid="profile-link">
                Profile
              </Button>
              <IconButton onClick={handleMenuOpen} sx={{ color: 'inherit' }} data-testid="user-avatar">
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user?.email?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem
                  onClick={handleMenuClose}
                  component={RouterLink}
                  to="/profile"
                  data-testid="profile-menu-item"
                >
                  My Profile
                </MenuItem>
                <MenuItem onClick={handleLogout} data-testid="logout-button">
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Sign In
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        {user ? (
          <>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              data-testid="user-email"
              sx={{
                background: 'linear-gradient(135deg, #d32f2f 0%, #4caf50 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
              }}
            >
              Welcome back, {user?.email}!
            </Typography>

            <Typography variant="h5" color="text.secondary" paragraph>
              Manage your help requests and profile
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              You can manage your profile, view your status, and connect with others who can help.
            </Typography>

            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/dashboard"
                sx={{
                  mr: 2,
                  background: 'linear-gradient(135deg, #d32f2f 0%, #4caf50 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #b71c1c 0%, #2e7d32 100%)',
                  },
                }}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={RouterLink}
                to="/profile"
                sx={{
                  borderColor: '#4caf50',
                  color: '#4caf50',
                  '&:hover': {
                    borderColor: '#2e7d32',
                    backgroundColor: 'rgba(76, 175, 80, 0.08)',
                  },
                }}
              >
                View Profile
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography
              variant="h2"
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
              Welcome to Gazaconfirm
            </Typography>

            <Typography variant="h5" color="text.secondary" paragraph>
              Connect with people who need help and those who can provide it
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Join our platform to manage your profile and connect with others.
            </Typography>

            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/register"
                sx={{
                  mr: 2,
                  background: 'linear-gradient(135deg, #d32f2f 0%, #4caf50 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #b71c1c 0%, #2e7d32 100%)',
                  },
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={RouterLink}
                to="/login"
                sx={{
                  borderColor: '#4caf50',
                  color: '#4caf50',
                  '&:hover': {
                    borderColor: '#2e7d32',
                    backgroundColor: 'rgba(76, 175, 80, 0.08)',
                  },
                }}
              >
                Sign In
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;
