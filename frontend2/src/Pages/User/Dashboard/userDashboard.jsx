import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  Report as ReportIcon,
  Person as PersonIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

const UserDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingInspections: 0,
    approvedInspections: 0,
    totalReports: 0,
  });

  const [recentBookings, setRecentBookings] = useState([
    // Mock data - replace with API call
    {
      id: 1,
      property: 'Luxury Apartment in Lekki',
      date: '2024-03-15',
      status: 'pending',
    },
    {
      id: 2,
      property: '3-Bedroom Duplex',
      date: '2024-03-10',
      status: 'approved',
    },
  ]);

  // Mock data for stats - replace with API call
  useEffect(() => {
    // Fetch user stats from API
    setStats({
      totalBookings: 5,
      pendingInspections: 2,
      approvedInspections: 3,
      totalReports: 1,
    });
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.name || 'User'}! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your property searches, inspections, and bookings from your dashboard.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Bookings
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalBookings}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 50, height: 50 }}>
                  <HomeIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Pending Inspections
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.pendingInspections}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 50, height: 50 }}>
                  <CalendarIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Approved Inspections
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.approvedInspections}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 50, height: 50 }}>
                  <ViewIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Reports
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalReports}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main', width: 50, height: 50 }}>
                  <ReportIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Recent Bookings */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Bookings
            </Typography>
            <List>
              {recentBookings.map((booking) => (
                <React.Fragment key={booking.id}>
                  <ListItem>
                    <ListItemIcon>
                      <HomeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={booking.property}
                      secondary={`Booked on: ${booking.date}`}
                    />
                    <Chip 
                      label={booking.status}
                      color={getStatusColor(booking.status)}
                      size="small"
                      sx={{ mr: 2 }}
                    />
                    <Button 
                      size="small" 
                      component={Link} 
                      to={`/user/bookings/${booking.id}`}
                    >
                      View
                    </Button>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button 
                variant="outlined" 
                component={Link} 
                to="/user/bookings"
              >
                View All Bookings
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <List>
              <ListItem button component={Link} to="/properties">
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Browse Properties" />
              </ListItem>
              <ListItem button component={Link} to="/user/bookings">
                <ListItemIcon>
                  <CalendarIcon />
                </ListItemIcon>
                <ListItemText primary="My Bookings" />
              </ListItem>
              <ListItem button component={Link} to="/user/reports/new">
                <ListItemIcon>
                  <ReportIcon />
                </ListItemIcon>
                <ListItemText primary="Submit Report" />
              </ListItem>
              <ListItem button component={Link} to="/user/profile">
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Edit Profile" />
              </ListItem>
            </List>
          </Paper>

          {/* Profile Summary */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Summary
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1" gutterBottom>
                {user?.email || 'Not provided'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Phone
              </Typography>
              <Typography variant="body1" gutterBottom>
                {user?.phone || 'Not provided'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Member Since
              </Typography>
              <Typography variant="body1">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              fullWidth 
              sx={{ mt: 2 }}
              component={Link}
              to="/user/profile"
            >
              Edit Profile
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserDashboard;