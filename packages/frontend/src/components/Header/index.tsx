import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, Box, IconButton } from '@mui/material';
import { AccountCircle, Logout, Person, People } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    void logout().then(() => navigate('/login'));
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleDashboard = () => {
    handleClose();
    if (userProfile?.role === 'admin' || userProfile?.role === 'super_admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleBrowseUsers = () => {
    handleClose();
    navigate('/browse');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const getDisplayName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getRoleDisplay = () => {
    if (!userProfile?.role) return '';

    switch (userProfile.role) {
      case 'admin':
        return 'Admin';
      case 'super_admin':
        return 'Super Admin';
      case 'help_seeker':
        return 'Help Seeker';
      default:
        return userProfile.role;
    }
  };

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1, cursor: 'pointer' }}
          onClick={handleHomeClick}
        >
          <Box
            component="img"
            src="/icon.svg"
            alt="GazaTrust.Me"
            sx={{
              width: 32,
              height: 32,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            }}
          />
          <Typography variant="h6" component="div">
            GazaTrust.Me
          </Typography>
        </Box>

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'center', sm: 'center' },
                gap: { xs: 0, sm: 1 },
              }}
            >
              <Typography variant="body2" color="inherit" sx={{ mr: { xs: 0, sm: 1 } }}>
                {getDisplayName()}
              </Typography>
              {userProfile?.role && (
                <Typography variant="caption" color="inherit" sx={{ mr: { xs: 0, sm: 1 } }}>
                  ({getRoleDisplay()})
                </Typography>
              )}
            </Box>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>
                <Person sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleBrowseUsers}>
                <People sx={{ mr: 1 }} />
                Browse Users
              </MenuItem>
              <MenuItem onClick={handleDashboard}>Dashboard</MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" onClick={handleLoginClick}>
              Login
            </Button>
            <Button color="inherit" onClick={handleRegisterClick}>
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
