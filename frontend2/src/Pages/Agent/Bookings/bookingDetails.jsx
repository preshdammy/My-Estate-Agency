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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
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
  AttachMoney as MoneyIcon,
  Edit as EditIcon,
  Message as MessageIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import api from '../../../services/api/apiClient';

const AgentBookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/agents/bookings/${id}`);
      console.log('Booking details:', response.data);
      setBooking(response.data);
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status, reason = '') => {
    setActionLoading(true);
    try {
      await api.put(`/bookings/agent/${id}/status`, {
        status: status,
        notes: reason,
      });
      
      fetchBookingDetails();
      setUpdateDialog(false);
      setNewStatus('');
      setNotes('');
    } catch (err) {
      console.error('Error updating booking:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'rejected': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircleIcon />;
      case 'approved': return <CheckCircleIcon />;
      case 'pending': return <PendingIcon />;
      case 'cancelled': return <CancelIcon />;
      case 'rejected': return <CancelIcon />;
      case 'completed': return <CheckCircleIcon />;
      default: return <PendingIcon />;
    }
  };

  const getSteps = (status) => {
    const steps = ['Booking Requested', 'Agent Review', 'Payment', 'Confirmed', 'Completed'];
    
    switch (status) {
      case 'pending': return { steps, activeStep: 1 };
      case 'approved': return { steps, activeStep: 2 };
      case 'confirmed': return { steps, activeStep: 3 };
      case 'completed': return { steps, activeStep: 4 };
      case 'cancelled': return { steps: ['Booking Requested', 'Cancelled'], activeStep: 1 };
      case 'rejected': return { steps: ['Booking Requested', 'Rejected'], activeStep: 1 };
      default: return { steps, activeStep: 0 };
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/400x300?text=No+Image';
    // If it's a full URL already, return it
    if (imagePath.startsWith('http')) return imagePath;
    // Otherwise construct the URL
    return `http://localhost:5006/uploads/apartments/${imagePath}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
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
          onClick={() => navigate('/agent/bookings')}
          sx={{ mt: 2 }}
        >
          Back to Bookings
        </Button>
      </Container>
    );
  }

  const { steps, activeStep } = getSteps(booking.status);
  const canUpdate = ['pending', 'approved', 'confirmed'].includes(booking.status);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/agent/bookings')}
        >
          Back to Bookings
        </Button>
        <Box>
          <Tooltip title="Print">
            <IconButton onClick={() => window.print()}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Paper sx={{ p: 4 }}>
        {/* Status Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
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
            sx={{ fontSize: '1rem', py: 2, px: 2 }}
          />
        </Box>

        {/* Progress Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column - Property Details */}
          <Grid item xs={12} md={7}>
            {/* Property Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Property Information
                </Typography>
                
                <Box
                  component="img"
                  src={getImageUrl(booking.apartment?.images?.[0])}
                  alt={booking.apartment?.location}
                  sx={{
                    width: '100%',
                    height: 250,
                    objectFit: 'cover',
                    borderRadius: 1,
                    mb: 2,
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />

                <Typography variant="h5" gutterBottom>
                  {booking.apartment?.location || 'N/A'}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip
                    label={booking.apartment?.category || 'N/A'}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={booking.apartment?.availability ? "Available" : "Rented"}
                    color={booking.apartment?.availability ? "success" : "error"}
                    size="small"
                  />
                  {booking.apartment?.bedrooms && (
                    <Chip
                      label={`${booking.apartment.bedrooms} Bedrooms`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {booking.apartment?.bathrooms && (
                    <Chip
                      label={`${booking.apartment.bathrooms} Bathrooms`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Typography variant="body1" paragraph>
                  {booking.apartment?.description || 'No description available.'}
                </Typography>

                <Typography variant="h6" color="primary" gutterBottom>
                  {formatPrice(booking.apartment?.price || booking.amount || 0)}
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    / year
                  </Typography>
                </Typography>

                <Button
                  variant="outlined"
                  component={Link}
                  to={`/properties/${booking.apartment?._id}`}
                  startIcon={<HomeIcon />}
                  sx={{ mt: 1 }}
                >
                  View Property Details
                </Button>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Timeline
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Requested on"
                      secondary={formatDate(booking.createdAt)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Updated"
                      secondary={formatDate(booking.updatedAt)}
                    />
                  </ListItem>
                  {booking.approvedAt && (
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Approved on"
                        secondary={formatDate(booking.approvedAt)}
                      />
                    </ListItem>
                  )}
                  {booking.completedAt && (
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Completed on"
                        secondary={formatDate(booking.completedAt)}
                      />
                    </ListItem>
                  )}
                </List>

                {booking.specialRequests && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Special Requests
                    </Typography>
                    <Typography variant="body2">
                      {booking.specialRequests}
                    </Typography>
                  </Box>
                )}

                {booking.notes && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                    <Typography variant="body2" color="primary" gutterBottom>
                      Agent Notes
                    </Typography>
                    <Typography variant="body2">
                      {booking.notes}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Client & Booking Info */}
          <Grid item xs={12} md={5}>
            {/* Client Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Client Information
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
                    {booking.user?.name?.charAt(0) || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{booking.user?.name || 'N/A'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Client
                    </Typography>
                  </Box>
                </Box>

                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={booking.user?.email || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={booking.user?.phone || 'N/A'}
                    />
                  </ListItem>
                </List>

                <Button
                  variant="outlined"
                  startIcon={<MessageIcon />}
                  href={`mailto:${booking.user?.email}`}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Contact Client
                </Button>
              </CardContent>
            </Card>

            {/* Booking Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Booking Information
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Booking Date</TableCell>
                        <TableCell>{formatDate(booking.createdAt)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <MoneyIcon fontSize="small" color="primary" />
                            <Typography variant="body2">
                              {formatPrice(booking.amount || booking.apartment?.price || 0)}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Payment Status</TableCell>
                        <TableCell>
                          <Chip
                            label={booking.paymentStatus || 'pending'}
                            color={booking.paymentStatus === 'paid' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Payment Method</TableCell>
                        <TableCell>{booking.paymentMethod || 'Not specified'}</TableCell>
                      </TableRow>
                      {booking.transactionId && (
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Transaction ID</TableCell>
                          <TableCell>{booking.transactionId}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Actions */}
            {canUpdate && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Actions
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          fullWidth
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleUpdateStatus('approved')}
                          disabled={actionLoading}
                        >
                          Approve Booking
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          fullWidth
                          startIcon={<CancelIcon />}
                          onClick={() => setUpdateDialog(true)}
                          disabled={actionLoading}
                        >
                          Reject Booking
                        </Button>
                      </>
                    )}
                    
                    {booking.status === 'approved' && (
                      <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleUpdateStatus('confirmed')}
                        disabled={actionLoading}
                      >
                        Confirm Booking
                      </Button>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <Button
                        variant="contained"
                        color="info"
                        fullWidth
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleUpdateStatus('completed')}
                        disabled={actionLoading}
                      >
                        Mark as Completed
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Rejection Dialog */}
      <Dialog open={updateDialog} onClose={() => setUpdateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Booking</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this booking.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for rejection"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Property no longer available, Client didn't respond, etc."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleUpdateStatus('rejected', notes)}
            variant="contained"
            color="error"
          >
            Reject Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AgentBookingDetails;