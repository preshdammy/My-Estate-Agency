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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Report as ReportIcon,
  PriorityHigh as PriorityIcon,
  Flag as FlagIcon,
  Message as MessageIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Edit as EditIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import api from '../../../services/api/apiClient';

const AgentReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Response Dialog
  const [responseDialog, setResponseDialog] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Status Dialog
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  // Resolve Confirmation
  const [resolveDialog, setResolveDialog] = useState(false);

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/agent/${id}`);
      console.log('Report details:', response.data);
      setReport(response.data);
      setNewStatus(response.data.status);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to load report details');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = () => {
    setResponseDialog(true);
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) return;
    
    setSubmitting(true);
    try {
      await api.put(`/reports/agent/${id}/respond`, {
        response: responseText,
      });
      
      setResponseDialog(false);
      setResponseText('');
      fetchReportDetails(); // Refresh data
    } catch (err) {
      console.error('Error responding to report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    setSubmitting(true);
    try {
      await api.put(`/reports/agent/${id}/status`, {
        status: newStatus,
      });
      
      setStatusDialog(false);
      fetchReportDetails();
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async () => {
    setSubmitting(true);
    try {
      await api.put(`/reports/agent/${id}/resolve`);
      
      setResolveDialog(false);
      fetchReportDetails();
    } catch (err) {
      console.error('Error resolving report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent': return 'Urgent - Needs Immediate Attention';
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Medium Priority';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'warning';
      case 'in_progress': return 'info';
      case 'resolved': return 'success';
      case 'escalated': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <PendingIcon />;
      case 'in_progress': return <FlagIcon />;
      case 'resolved': return <CheckCircleIcon />;
      case 'escalated': return <PriorityIcon />;
      default: return <ReportIcon />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !report) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Report not found'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/agent/reports')}
          sx={{ mt: 2 }}
        >
          Back to Reports
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/agent/reports')}
        >
          Back to Reports
        </Button>
        <Typography variant="caption" color="text.secondary">
          Report ID: {report._id}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content - Left Column */}
        <Grid item xs={12} md={8}>
          {/* Report Header Card */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h5" gutterBottom>
                  {report.subject || 'Report Details'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip
                    icon={<PriorityIcon />}
                    label={getPriorityLabel(report.priority)}
                    color={getPriorityColor(report.priority)}
                  />
                  <Chip
                    icon={getStatusIcon(report.status)}
                    label={report.status?.toUpperCase()}
                    color={getStatusColor(report.status)}
                  />
                  <Chip
                    label={report.reportType || 'General'}
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>

            {/* Report Message */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Report Message
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#faf5f0' }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {report.message || 'No message provided'}
                </Typography>
              </Paper>
            </Box>

            {/* Agent Response */}
            {report.agentResponse && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Your Response
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {report.agentResponse}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Responded on {formatDate(report.respondedAt)}
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Resolution Notes */}
            {report.resolutionNotes && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Resolution Notes
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {report.resolutionNotes}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Resolved on {formatDate(report.resolvedAt)}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Paper>

          {/* Timeline/History */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Timeline
            </Typography>
            <Timeline position="right">
              <TimelineItem>
                <TimelineOppositeContent sx={{ flex: 0.2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(report.createdAt)}
                  </Typography>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color="primary">
                    <ReportIcon fontSize="small" />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="subtitle2">Report Submitted</Typography>
                  <Typography variant="caption" color="text.secondary">
                    By {report.user?.name}
                  </Typography>
                </TimelineContent>
              </TimelineItem>

              {report.respondedAt && (
                <TimelineItem>
                  <TimelineOppositeContent sx={{ flex: 0.2 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(report.respondedAt)}
                    </Typography>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color="info">
                      <MessageIcon fontSize="small" />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2">Agent Responded</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Response sent to {report.user?.name}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              )}

              {report.status === 'in_progress' && (
                <TimelineItem>
                  <TimelineOppositeContent sx={{ flex: 0.2 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(report.updatedAt)}
                    </Typography>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color="warning">
                      <FlagIcon fontSize="small" />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2">In Progress</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Investigation ongoing
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              )}

              {report.resolvedAt && (
                <TimelineItem>
                  <TimelineOppositeContent sx={{ flex: 0.2 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(report.resolvedAt)}
                    </Typography>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color="success">
                      <CheckCircleIcon fontSize="small" />
                    </TimelineDot>
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2">Resolved</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Issue resolved
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              )}
            </Timeline>
          </Paper>
        </Grid>

        {/* Sidebar - Right Column */}
        <Grid item xs={12} md={4}>
          {/* Property Information */}
          {report.property && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Related Property
              </Typography>
              <Box
                component="img"
                src={
                  report.property.images?.length > 0
                    ? `http://localhost:5006/uploads/apartments/${report.property.images[0]}`
                    : 'https://via.placeholder.com/300x200?text=No+Image'
                }
                alt={report.property.location}
                sx={{
                  width: '100%',
                  height: 150,
                  objectFit: 'cover',
                  borderRadius: 1,
                  mb: 2,
                }}
              />
              <Typography variant="subtitle1" gutterBottom>
                {report.property.location}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Category: {report.property.category}
              </Typography>
              <Typography variant="body2" color="primary" gutterBottom>
                Price: ₦{report.property.price?.toLocaleString()}
              </Typography>
              <Button
                component={Link}
                to={`/properties/${report.property._id}`}
                variant="outlined"
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                startIcon={<HomeIcon />}
              >
                View Property
              </Button>
            </Paper>
          )}

          {/* Reporter Information */}
          {report.user && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Reported By
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ width: 50, height: 50, bgcolor: 'primary.main' }}>
                  {report.user.name?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">{report.user.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    User
                  </Typography>
                </Box>
              </Box>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Email" secondary={report.user.email} />
                </ListItem>
                {report.user.phone && (
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Phone" secondary={report.user.phone} />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Member Since"
                    secondary={report.user.createdAt ? formatDate(report.user.createdAt) : 'N/A'}
                  />
                </ListItem>
              </List>
            </Paper>
          )}

          {/* Actions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>

            {report.status !== 'resolved' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<MessageIcon />}
                  onClick={handleRespond}
                  fullWidth
                >
                  Respond to Report
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<FlagIcon />}
                  onClick={() => setStatusDialog(true)}
                  fullWidth
                >
                  Update Status
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => setResolveDialog(true)}
                  fullWidth
                >
                  Mark as Resolved
                </Button>
              </Box>
            )}

            {report.status === 'resolved' && (
              <Alert severity="success" sx={{ mt: 2 }}>
                This report has been resolved.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Response Dialog */}
      <Dialog open={responseDialog} onClose={() => setResponseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Respond to Report</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom>
            Report from {report.user?.name}
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="body2">{report.message}</Typography>
          </Paper>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Response"
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Type your response here..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitResponse}
            variant="contained"
            disabled={!responseText.trim() || submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {submitting ? 'Sending...' : 'Send Response'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)}>
        <DialogTitle>Update Report Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="escalated">Escalated</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resolve Confirmation Dialog */}
      <Dialog open={resolveDialog} onClose={() => setResolveDialog(false)}>
        <DialogTitle>Mark as Resolved</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark this report as resolved?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            The user will be notified that their report has been resolved.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialog(false)}>Cancel</Button>
          <Button
            onClick={handleResolve}
            variant="contained"
            color="success"
            disabled={submitting}
          >
            {submitting ? 'Processing...' : 'Yes, Resolve'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AgentReportDetails;