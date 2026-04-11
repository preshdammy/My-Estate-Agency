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
import FavoriteIcon from "@mui/icons-material/Favorite";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import ListItemText from "@mui/material/ListItemText";
import api from "../../../services/api/apiClient";

const Navbar = () => {
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const { user, role } = useSelector((state) => state.auth);
  const [favoriteAnchor, setFavoriteAnchor] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const openFavorites = Boolean(favoriteAnchor);
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


   useEffect(() => {
      if (!user) return;

      const fetchNotifications = async () => {
        try {
          const res = await api.get("/notifications");
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        } catch (err) {
          console.error(err);
        }
      };

      const fetchFavorites = async () => {
        try {
          const res = await api.get("/favorites");
          
          setFavorites(res.data || []);
          setFavoriteCount(res.data.length || 0);
        } catch (err) {
          console.error(err);
        }
      };

      fetchNotifications();
      fetchFavorites();

      const interval = setInterval(() => {
        fetchNotifications();
        fetchFavorites();
      }, 5000);

      return () => clearInterval(interval);
    }, [user, role]);


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
     <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>

  {/* LEFT - LOGO */}
  <Box>
    <Typography variant="h6">
      <Link to="/" style={{ color: "white", textDecoration: "none" }}>
        🏠 RealEstate Pro
      </Link>
    </Typography>
  </Box>

  {/* CENTER - NAV LINKS */}
  <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
    <Button color="inherit" component={Link} to="/properties">
      Properties
    </Button>

    {user && role && (
      <Button color="inherit" component={Link} to={getDashboardLink()}>
        Dashboard
      </Button>
    )}
  </Box>

  {/* RIGHT - ACTIONS */}
  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

    {user && role && (
      <>
      <IconButton
          color="inherit"
          onClick={(e) => setFavoriteAnchor(e.currentTarget)}
        >
        <Badge badgeContent={favoriteCount} color="error">
          <FavoriteIcon />
        </Badge>
      </IconButton>


        {/* Notifications */}
        <IconButton color="inherit" onClick={handleOpenNotifications}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleCloseNotifications}
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

        <Menu
          anchorEl={favoriteAnchor}
          open={openFavorites}
          onClose={() => setFavoriteAnchor(null)}
          PaperProps={{ style: { width: 350 } }}
        >
          {favoriteCount === 0 ? (
            <MenuItem>
              <Typography variant="body2">No favorites yet</Typography>
            </MenuItem>
          ) : (
            favorites.slice(0, 3).map((fav) => (
              <MenuItem
                key={fav.id}
                onClick={() => {
                  navigate(`/properties/${fav.apartment._id}`);
                  setFavoriteAnchor(null);
                }}
              >
                <ListItemText
                  primary={fav.apartment.location}
                  secondary={`₦${fav.apartment.price}`}
                />
              </MenuItem>
            ))
          )}

          <MenuItem
            onClick={() => {
              navigate("/user/favorites");
              setFavoriteAnchor(null);
            }}
          >
            <Typography color="primary">View All Favorites</Typography>
          </MenuItem>
        </Menu>

        {/* Profile */}
        <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)} color="inherit">
          <Avatar>{user?.name?.charAt(0) || "U"}</Avatar>
        </IconButton>

        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={() => setProfileAnchor(null)}
        >
          <MenuItem
            onClick={() => {
              navigate("/profile");
              setProfileAnchor(null);
            }}
          >
            Profile
          </MenuItem>

          <MenuItem onClick={handleLogout}>
            Logout
          </MenuItem>
        </Menu>
      </>
    )}

    {!user && (
      <>
        <Button color="inherit" component={Link} to="/login">
          Login
        </Button>

        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/register"
        >
          Register
        </Button>
      </>
    )}

  </Box>

</Toolbar>
    </AppBar>
  );
};

export default Navbar;