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
  CircularProgress,
} from '@mui/material';
import {
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  Report as ReportIcon,
  Person as PersonIcon,
  Visibility as ViewIcon,
  Bookmark as BookmarkIcon,
} from '@mui/icons-material';
import api from '../../../services/api/apiClient';

const UserDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingInspections: 0,
    approvedInspections: 0,
    totalReports: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentInspections, setRecentInspections] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch user's bookings
      const bookingsRes = await api.get('/users/bookings');
      setRecentBookings(bookingsRes.data.slice(0, 3));
      
      // Fetch user's inspection requests
      const inspectionsRes = await api.get('/users/inspections');
      setRecentInspections(inspectionsRes.data.slice(0, 3));
      
      // Calculate stats
      setStats({
        totalBookings: bookingsRes.data.length,
        pendingInspections: inspectionsRes.data.filter(i => i.status === 'pending').length,
        approvedInspections: inspectionsRes.data.filter(i => i.status === 'approved').length,
        totalReports: 0, // You'll fetch this later
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 70, height: 70, bgcolor: 'white', color: '#1976d2' }}>
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
            </Typography>
            <Typography variant="body1">
              Find your dream home, manage bookings, and track inspections from your dashboard.
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
                <Avatar sx={{ bgcolor: '#1976d2', width: 50, height: 50 }}>
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
                <Avatar sx={{ bgcolor: '#ed6c02', width: 50, height: 50 }}>
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
                <Avatar sx={{ bgcolor: '#2e7d32', width: 50, height: 50 }}>
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
                    Saved Properties
                  </Typography>
                  <Typography variant="h4">
                    3
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#9c27b0', width: 50, height: 50 }}>
                  <BookmarkIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Recent Bookings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Bookings
            </Typography>
            {recentBookings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="text.secondary">
                  No bookings yet
                </Typography>
                <Button 
                  component={Link} 
                  to="/properties"
                  variant="outlined" 
                  sx={{ mt: 2 }}
                >
                  Browse Properties
                </Button>
              </Box>
            ) : (
              <List>
                {recentBookings.map((booking) => (
                  <React.Fragment key={booking._id}>
                    <ListItem>
                      <ListItemIcon>
                        <HomeIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={booking.apartment?.location || 'Property'}
                        secondary={`Booked on: ${new Date(booking.createdAt).toLocaleDateString()}`}
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
                        to={`/user/bookings/${booking._id}`}
                      >
                        View
                      </Button>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button 
                component={Link} 
                to="/user/bookings"
              >
                View All Bookings
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Inspections */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Inspection Requests
            </Typography>
            {recentInspections.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="text.secondary">
                  No inspection requests yet
                </Typography>
                <Button 
                  component={Link} 
                  to="/properties"
                  variant="outlined" 
                  sx={{ mt: 2 }}
                >
                  Request Inspection
                </Button>
              </Box>
            ) : (
              <List>
                {recentInspections.map((inspection) => (
                  <React.Fragment key={inspection._id}>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={inspection.apartment?.location || 'Property'}
                        secondary={`Date: ${new Date(inspection.date).toLocaleDateString()}`}
                      />
                      <Chip 
                        label={inspection.status}
                        color={getStatusColor(inspection.status)}
                        size="small"
                        sx={{ mr: 2 }}
                      />
                      <Button 
                        size="small" 
                        component={Link} 
                        to={`/user/inspections/${inspection._id}`}
                      >
                        View
                      </Button>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button 
                component={Link} 
                to="/user/inspections"
              >
                View All Inspections
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  to="/properties"
                  variant="outlined"
                  fullWidth
                  sx={{ py: 2 }}
                  startIcon={<HomeIcon />}
                >
                  Browse Properties
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  to="/user/bookings"
                  variant="outlined"
                  fullWidth
                  sx={{ py: 2 }}
                  startIcon={<CalendarIcon />}
                >
                  My Bookings
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  to="/user/reports/new"
                  variant="outlined"
                  fullWidth
                  sx={{ py: 2 }}
                  startIcon={<ReportIcon />}
                >
                  Submit Report
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={Link}
                  to="/user/profile"
                  variant="outlined"
                  fullWidth
                  sx={{ py: 2 }}
                  startIcon={<PersonIcon />}
                >
                  Edit Profile
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserDashboard;