import { Box, Container, Typography, Button, AppBar, Toolbar, Avatar, Menu, MenuItem, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const HomePage = () => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
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
            <Typography variant="h2" component="h1" gutterBottom data-testid="user-email">
              Welcome back, {user?.email}!
            </Typography>

            <Typography variant="h5" color="text.secondary" paragraph>
              Manage your help requests and profile
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              You can manage your profile, view your status, and connect with others who can help.
            </Typography>

            <Box sx={{ mt: 4 }}>
              <Button variant="contained" size="large" component={RouterLink} to="/dashboard" sx={{ mr: 2 }}>
                Go to Dashboard
              </Button>
              <Button variant="outlined" size="large" component={RouterLink} to="/profile">
                View Profile
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h2" component="h1" gutterBottom>
              Welcome to Gazaconfirm
            </Typography>

            <Typography variant="h5" color="text.secondary" paragraph>
              Connect with people who need help and those who can provide it
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Join our platform to manage your profile and connect with others.
            </Typography>

            <Box sx={{ mt: 4 }}>
              <Button variant="contained" size="large" component={RouterLink} to="/register" sx={{ mr: 2 }}>
                Get Started
              </Button>
              <Button variant="outlined" size="large" component={RouterLink} to="/login">
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
