import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,

} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Schedule as ScheduleIcon,
  Message as MessageIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import api from '../../../services/api/apiClient';

const InspectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rescheduleDialog, setRescheduleDialog] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '',
    notes: '',
  });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchInspectionDetails();
  }, [id]);

 const fetchInspectionDetails = async () => {
  setLoading(true);
  try {
    const response = await api.get(`/inspections/${id}`);
    console.log("Inspection details:", response.data);

    setInspection(response.data.request || response.data);

  } catch (err) {
    console.error("Error fetching inspection details:", err);
    setError("Failed to load inspection details");
  } finally {
    setLoading(false);
  }
};

  const handleApprove = () => {
    setActionType('approve');
    setActionDialog(true);
  };

  const handleReject = () => {
    setActionType('reject');
    setActionDialog(true);
  };

  const handleReschedule = () => {
    setRescheduleDialog(true);
  };

  const handleActionConfirm = async () => {
    try {
      if (actionType === 'approve') {
        await api.put(`/inspections/agent/${id}/status`, {
          status: 'approved',
          notes: notes,
        });
      } else if (actionType === 'reject') {
        await api.put(`/inspections/agent/${id}/status`, {
          status: 'rejected',
          rejectionReason,
        });
      } else if (actionType === 'complete') {
        await api.put(`/inspections/agent/${id}/complete`);
      }
      
      fetchInspectionDetails();
      setActionDialog(false);
      setRejectionReason('');
      setNotes('');
    } catch (err) {
      console.error('Error updating inspection:', err);
    }
  };

  const handleRescheduleSubmit = async () => {
    try {
        await api.put(`/inspections/${id}/reschedule`, {
        date: rescheduleData.date,
        time: rescheduleData.time,
        });
      
      fetchInspectionDetails();
      setRescheduleDialog(false);
      setRescheduleData({ date: '', time: '', notes: '' });
    } catch (err) {
      console.error('Error rescheduling inspection:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon color="success" fontSize="large" />;
      case 'pending': return <PendingIcon color="warning" fontSize="large" />;
      case 'rejected': return <CancelIcon color="error" fontSize="large" />;
      case 'completed': return <CheckCircleIcon color="success" fontSize="large" />;
      case 'scheduled': return <ScheduleIcon color="info" fontSize="large" />;
      default: return <PendingIcon color="warning" fontSize="large" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'completed': return 'success';
      case 'scheduled': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'TBD';
    return timeString;
  };

  const formatDateTime = (dateString, timeString) => {
    return `${formatDate(dateString)} at ${formatTime(timeString)}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !inspection) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Inspection not found'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/agent/inspections')}
          sx={{ mt: 2 }}
        >
          Back to Inspections
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/agent/inspections')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Inspection Details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content - Left Column */}
        <Grid item xs={12} md={8}>
          {/* Status Card */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {getStatusIcon(inspection.status)}
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {inspection.apartment?.location || 'Property Inspection'}
                  </Typography>
                  <Chip
                    label={inspection.status.toUpperCase()}
                    color={getStatusColor(inspection.status)}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Request ID: {inspection._id}
              </Typography>
            </Box>
          </Paper>

          {/* Property Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Property Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HomeIcon color="primary" />
                  <Typography variant="body1">
                    <strong>Location:</strong> {inspection.apartment?.location || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Price
                </Typography>
                <Typography variant="body1">
                  ₦{inspection.apartment?.price?.toLocaleString() || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1">
                  {inspection.apartment?.category || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
            <Button
              component={Link}
              to={`/properties/${inspection.apartment?._id}`}
              variant="outlined"
              size="small"
              sx={{ mt: 2 }}
            >
              View Property Details
            </Button>
          </Paper>

          {/* Inspection Details */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Inspection Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Requested Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(inspection.date)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimeIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Requested Time
                    </Typography>
                    <Typography variant="body1">
                      {formatTime(inspection.time)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MessageIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Client Message
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5', mt: 1 }}>
                      <Typography variant="body1">
                        {inspection.message || 'No message provided'}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Timeline/History */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Timeline
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Request Submitted"
                  secondary={formatDateTime(inspection.createdAt, '')}
                />
              </ListItem>
              {inspection.status !== 'pending' && (
                <ListItem>
                  <ListItemIcon>
                    {inspection.status === 'approved' && <CheckCircleIcon color="success" />}
                    {inspection.status === 'rejected' && <CancelIcon color="error" />}
                    {inspection.status === 'completed' && <CheckCircleIcon color="success" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={`Request ${inspection.status}`}
                    secondary={formatDateTime(inspection.updatedAt, '')}
                  />
                </ListItem>
              )}
              {inspection.status === 'completed' && (
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Inspection Completed"
                    secondary={formatDateTime(inspection.completedAt, '')}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Sidebar - Right Column */}
        <Grid item xs={12} md={4}>
          {/* Client Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Client Information
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
                {inspection.user?.name?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h6">{inspection.user?.name || 'N/A'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Client
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Email"
                  secondary={inspection.user?.email || 'N/A'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Phone"
                  secondary={inspection.user?.phone || 'N/A'}
                />
              </ListItem>
            </List>
          </Paper>

          {/* Actions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            
            {inspection.status === 'pending' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  startIcon={<CheckIcon />}
                  onClick={handleApprove}
                >
                  Approve Request
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  startIcon={<CloseIcon />}
                  onClick={handleReject}
                >
                  Reject Request
                </Button>
                <Button
                  variant="outlined"
                  color="info"
                  fullWidth
                  startIcon={<ScheduleIcon />}
                  onClick={handleReschedule}
                >
                  Reschedule
                </Button>
              </Box>
            )}

            {inspection.status === 'approved' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  startIcon={<CheckCircleIcon />}
                  onClick={() => {
                    setActionType('complete');
                    setActionDialog(true);
                  }}
                >
                  Mark as Completed
                </Button>
                <Button
                  variant="outlined"
                  color="info"
                  fullWidth
                  startIcon={<ScheduleIcon />}
                  onClick={handleReschedule}
                >
                  Reschedule
                </Button>
              </Box>
            )}

            {inspection.status === 'approved' && inspection.scheduledDate && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="body2" color="primary">
                  <strong>Scheduled for:</strong>
                </Typography>
                <Typography variant="body2">
                  {formatDateTime(inspection.scheduledDate, inspection.scheduledTime)}
                </Typography>
              </Box>
            )}

            {inspection.status === 'rejected' && inspection.rejectionReason && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
                <Typography variant="body2" color="error">
                  <strong>Rejection Reason:</strong>
                </Typography>
                <Typography variant="body2">
                  {inspection.rejectionReason}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Notes */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Agent Notes
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Add private notes about this inspection..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button
              variant="outlined"
              fullWidth
              startIcon={<EditIcon />}
              sx={{ mt: 2 }}
              onClick={() => {
                // Save notes functionality
                console.log('Save notes:', notes);
              }}
            >
              Save Notes
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Dialog */}
      <Dialog open={actionDialog} onClose={() => setActionDialog(false)}>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Inspection' : 
           actionType === 'reject' ? 'Reject Inspection' : 
           'Mark as Completed'}
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to {actionType} this inspection request?
          </Typography>
          {actionType === 'approve' && (
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Additional notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
          {actionType === 'reject' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason for rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              sx={{ mt: 2 }}
              required
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>Cancel</Button>
          <Button
            onClick={handleActionConfirm}
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
            disabled={actionType === 'reject' && !rejectionReason}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialog} onClose={() => setRescheduleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reschedule Inspection</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a new date and time for the inspection
          </Typography>
          <TextField
            fullWidth
            type="date"
            label="New Date"
            value={rescheduleData.date}
            onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="time"
            label="New Time"
            value={rescheduleData.time}
            onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Message to client"
            value={rescheduleData.notes}
            onChange={(e) => setRescheduleData({ ...rescheduleData, notes: e.target.value })}
            placeholder="Explain why you're rescheduling (optional)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescheduleDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRescheduleSubmit}
            variant="contained"
            color="info"
            disabled={!rescheduleData.date || !rescheduleData.time}
          >
            Confirm Reschedule
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InspectionDetails;