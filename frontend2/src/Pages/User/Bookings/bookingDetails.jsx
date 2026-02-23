import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  Divider,
  Card,
  CardContent,
  Avatar,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Home as HomeIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import api from '../../../services/api/apiClient';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users/bookings/${id}`);
      setBooking(response.data);
    } catch (err) {
      console.error('Error fetching booking:', err);
      // Mock data for development
      setBooking(mockBooking);
    } finally {
      setLoading(false);
    }
  };

  // Mock data
  const mockBooking = {
    _id: id,
    property: {
      _id: 'p1',
      location: 'Lekki Phase 1, Lagos',
      price: 5000000,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      category: '3-Bedroom',
      description: 'Beautiful apartment with sea view and modern amenities.',
      agent: {
        name: 'John Agent',
        phone: '+234 801 234 5678',
        email: 'john.agent@realestate.com',
        avatar: 'https://i.pravatar.cc/150?img=1',
        rating: 4.5,
      },
    },
    bookingDate: '2024-02-15T10:00:00Z',
    status: 'confirmed',
    paymentStatus: 'paid',
    amount: 5000000,
    paymentMethod: 'Bank Transfer',
    transactionId: 'TRX123456789',
    specialRequests: 'Would prefer ground floor if available',
    createdAt: '2024-02-10T14:30:00Z',
    updatedAt: '2024-02-11T09:15:00Z',
  };

  const steps = ['Booking Requested', 'Payment Processed', 'Booking Confirmed', 'Inspection Scheduled'];

  const getStatusStep = (status) => {
    switch (status) {
      case 'pending': return 1;
      case 'confirmed': return 2;
      case 'completed': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !booking) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Booking not found'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/user/bookings')}
          sx={{ mt: 2 }}
        >
          Back to Bookings
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/user/bookings')}
        sx={{ mb: 2 }}
      >
        Back to Bookings
      </Button>

      <Paper sx={{ p: 4 }}>
        {/* Status Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Booking Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Booking ID: {booking._id}
            </Typography>
          </Box>
          <Chip
            icon={getStatusIcon(booking.status)}
            label={booking.status.toUpperCase()}
            color={getStatusColor(booking.status)}
            sx={{ fontSize: '1rem', py: 2 }}
          />
        </Box>

        {/* Progress Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={getStatusStep(booking.status)} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Grid container spacing={4}>
          {/* Property Details */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Property Details
                </Typography>
                
                <Box
                  component="img"
                  src={booking.property.image}
                  alt={booking.property.location}
                  sx={{
                    width: '100%',
                    height: 300,
                    objectFit: 'cover',
                    borderRadius: 1,
                    mb: 2,
                  }}
                />

                <Typography variant="h5" gutterBottom>
                  {booking.property.location}
                </Typography>
                
                <Chip
                  label={booking.property.category}
                  color="primary"
                  size="small"
                  sx={{ mb: 2 }}
                />

                <Typography variant="body1" paragraph>
                  {booking.property.description}
                </Typography>

                <Typography variant="h6" color="primary" gutterBottom>
                  {formatPrice(booking.amount)}
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    / year
                  </Typography>
                </Typography>

                <Button
                  variant="outlined"
                  component={Link}
                  to={`/properties/${booking.property._id}`}
                  sx={{ mt: 2 }}
                >
                  View Property Details
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Booking Information */}
          <Grid item xs={12} md={4}>
            {/* Agent Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Agent Information
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    src={booking.property.agent.avatar}
                    sx={{ width: 50, height: 50 }}
                  />
                  <Box>
                    <Typography variant="subtitle1">
                      {booking.property.agent.name}
                    </Typography>
                    <Rating value={booking.property.agent.rating} readOnly size="small" />
                  </Box>
                </Box>

                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={booking.property.agent.phone}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={booking.property.agent.email}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Booking Information
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Booking Date"
                      secondary={formatDate(booking.bookingDate)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ReceiptIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Payment Status"
                      secondary={
                        <Chip
                          label={booking.paymentStatus}
                          color={booking.paymentStatus === 'paid' ? 'success' : 'warning'}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Payment Method"
                      secondary={booking.paymentMethod}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Transaction ID"
                      secondary={booking.transactionId}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Timeline
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Requested on"
                      secondary={formatDate(booking.createdAt)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Last Updated"
                      secondary={formatDate(booking.updatedAt)}
                    />
                  </ListItem>
                </List>

                {booking.specialRequests && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Special Requests
                    </Typography>
                    <Alert severity="info" sx={{ mt: 1 }}>
                      {booking.specialRequests}
                    </Alert>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default BookingDetails;