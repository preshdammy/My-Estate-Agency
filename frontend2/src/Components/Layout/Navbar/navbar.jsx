import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../Store/slices/authSlice';
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
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import ListItemText from "@mui/material/ListItemText";
import api from "../../../services/api/apiClient";

const Navbar = () => {
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleMenu = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    handleClose();
  };

  const fetchNotifications = async () => {
  try {
    const res = await api.get("/notifications");

    setNotifications(res.data.notifications);
    setUnreadCount(res.data.unreadCount);
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
 };

  useEffect(() => {
     fetchNotifications();
  }, []);

  const handleOpenNotifications = (event) => {
  setNotificationAnchor(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationAnchor(null);
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
             <>
                <Button color="inherit" component={Link} to={getDashboardLink()}>
                  Dashboard
                </Button>

                {/* 🔔 Notifications */}
                <IconButton color="inherit" onClick={(e) => setNotificationAnchor(e.currentTarget)}>
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>

                <Menu
                  anchorEl={notificationAnchor}
                  open={Boolean(notificationAnchor)}
                  onClose={() => setNotificationAnchor(null)}
                  PaperProps={{ style: { width: 350 } }}
                >
                  {notifications.length === 0 ? (
                    <MenuItem>
                      <Typography variant="body2">No notifications</Typography>
                    </MenuItem>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <MenuItem
                        key={notification._id}
                        onClick={async () => {
                          try {
                            await api.put(`/notifications/${notification._id}/read`);

                            if (notification.actionUrl) {
                              navigate(notification.actionUrl);
                            }

                            setNotificationAnchor(null);
                            fetchNotifications();
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                      >
                        <ListItemText
                          primary={notification.title}
                          secondary={notification.message}
                          primaryTypographyProps={{
                            fontWeight: notification.isRead ? "normal" : "bold"
                          }}
                        />
                      </MenuItem>
                    ))
                  )}
                </Menu>

                {/* 👤 Profile */}
                <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)} color="inherit">
                  <Avatar>{user?.name?.charAt(0) || "U"}</Avatar>
                </IconButton>

                <Menu
                  anchorEl={profileAnchor}
                  open={Boolean(profileAnchor)}
                  onClose={() => setProfileAnchor(null)}
                >
                  <MenuItem onClick={() => { navigate("/profile"); setProfileAnchor(null); }}>
                    Profile
                  </MenuItem>

                  <MenuItem onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
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
          <Menu anchorEl={profileAnchor} open={Boolean(profileAnchor)} onClose={() => setProfileAnchor(null)}>
            <MenuItem component={Link} to="/properties" onClick={() => setProfileAnchor(null)}>
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