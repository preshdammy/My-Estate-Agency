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
      const response = await api.get('bookings/my-bookings');
      setBookings(response.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
      // Mock data for development
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
  switch (status) {
    case 'approved': return 'success';
    case 'pending': return 'warning';
    case 'rejected': return 'error';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

  const getStatusIcon = (status) => {
  switch (status) {
    case 'approved': return <CheckCircleIcon />;
    case 'pending': return <PendingIcon />;
    case 'rejected': return <CancelIcon />;
    case 'cancelled': return <CancelIcon />;
    default: return <CalendarIcon />;
  }
};

  const filteredBookings = tabValue === 0 
    ? bookings 
    : bookings.filter(b => 
        tabValue === 1 ? b.status === 'approved' :
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
                      src={
                          booking.apartment?.images?.length > 0
                            ? `http://localhost:5006/uploads/apartments/${booking.apartment.images[0]}`
                            : "https://via.placeholder.com/300"
                        }
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
                        {booking.apartment?.location}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatPrice(booking.apartment?.price || 0)}
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
                        src={
                            booking.apartment?.images?.[0]
                              ? `http://localhost:5006/uploads/apartments/${booking.apartment.images[0]}`
                              : "https://via.placeholder.com/300"
                          }
                        sx={{
                          width: 60,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 1,
                        }}
                      />
                      <Typography>{booking.apartment?.location}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{formatPrice(booking.apartment?.price || 0)}</TableCell>
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