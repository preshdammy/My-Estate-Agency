import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../Store/slices/authSlice';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    handleClose();
  };

  const getDashboardLink = () => {
    switch (role) {
      case 'admin': return '/admin/dashboard';
      case 'agent': return '/agent/dashboard';
      case 'user': return '/user/dashboard';
      default: return '/';
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            🏠 RealEstate Pro
          </Link>
        </Typography>

        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Button color="inherit" component={Link} to="/properties">
            Properties
          </Button>
          
          {user ? (
            <>
              <Button color="inherit" component={Link} to={getDashboardLink()}>
                Dashboard
              </Button>
              <IconButton onClick={handleMenu} color="inherit">
                <Avatar>{user?.name?.charAt(0) || 'U'}</Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>

        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton color="inherit" onClick={handleMenu}>
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            <MenuItem component={Link} to="/properties" onClick={handleClose}>
              Properties
            </MenuItem>
            {user ? (
              [
                <MenuItem key="dashboard" component={Link} to={getDashboardLink()} onClick={handleClose}>
                  Dashboard
                </MenuItem>,
                <MenuItem key="profile" component={Link} to="/profile" onClick={handleClose}>
                  Profile
                </MenuItem>,
                <MenuItem key="logout" onClick={handleLogout}>
                  Logout
                </MenuItem>
              ]
            ) : (
              [
                <MenuItem key="login" component={Link} to="/login" onClick={handleClose}>
                  Login
                </MenuItem>,
                <MenuItem key="register" component={Link} to="/register" onClick={handleClose}>
                  Register
                </MenuItem>
              ]
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;