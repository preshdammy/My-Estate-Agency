import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Box,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import api from '../../../services/api/apiClient';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/bookings');
      setBookings(response.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
      // Mock data for development
      setBookings(mockBookings);
    } finally {
      setLoading(false);
    }
  };

  // Mock data
  const mockBookings = [
    {
      _id: '1',
      property: {
        _id: 'p1',
        location: 'Lekki Phase 1, Lagos',
        price: 5000000,
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500',
      },
      date: '2024-02-15',
      status: 'confirmed',
      amount: 5000000,
    },
    {
      _id: '2',
      property: {
        _id: 'p2',
        location: 'Victoria Island, Lagos',
        price: 7500000,
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500',
      },
      date: '2024-02-20',
      status: 'pending',
      amount: 7500000,
    },
    {
      _id: '3',
      property: {
        _id: 'p3',
        location: 'Ikeja, Lagos',
        price: 2500000,
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
      },
      date: '2024-01-10',
      status: 'cancelled',
      amount: 2500000,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircleIcon />;
      case 'pending': return <PendingIcon />;
      case 'cancelled': return <CancelIcon />;
      default: return <CalendarIcon />;
    }
  };

  const filteredBookings = tabValue === 0 
    ? bookings 
    : bookings.filter(b => 
        tabValue === 1 ? b.status === 'confirmed' :
        tabValue === 2 ? b.status === 'pending' :
        b.status === 'cancelled'
      );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Bookings
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          variant={isMobile ? 'fullWidth' : 'standard'}
        >
          <Tab label="All" />
          <Tab label="Confirmed" />
          <Tab label="Pending" />
          <Tab label="Cancelled" />
        </Tabs>
      </Paper>

      {filteredBookings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bookings found
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/properties"
            sx={{ mt: 2 }}
          >
            Browse Properties
          </Button>
        </Paper>
      ) : isMobile ? (
        // Mobile card view
        <Grid container spacing={2}>
          {filteredBookings.map((booking) => (
            <Grid item xs={12} key={booking._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      component="img"
                      src={booking.property.image}
                      sx={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 1,
                        mr: 2,
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1">
                        {booking.property.location}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(booking.date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatPrice(booking.amount)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      icon={getStatusIcon(booking.status)}
                      label={booking.status}
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                    <Button
                      size="small"
                      component={Link}
                      to={`/user/bookings/${booking._id}`}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        // Desktop table view
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Property</TableCell>
                <TableCell>Booking Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        component="img"
                        src={booking.property.image}
                        sx={{
                          width: 60,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 1,
                        }}
                      />
                      <Typography>{booking.property.location}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(booking.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{formatPrice(booking.amount)}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(booking.status)}
                      label={booking.status}
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      component={Link}
                      to={`/user/bookings/${booking._id}`}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default MyBookings;