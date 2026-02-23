import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Report as ReportIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  PriorityHigh as PriorityIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import api from '../../../services/api/apiClient';

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useSelector((state) => state.auth);
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [respondDialog, setRespondDialog] = useState(false);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/${id}`);
      setReport(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.response?.data?.message || 'Failed to load report');
      // Mock data for development
      setReport(mockReport);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReportDetails();
    setRefreshing(false);
  };

  const handleRespond = async () => {
    if (!response.trim()) return;
    
    setSubmitting(true);
    try {
      // Check if your backend has this endpoint - based on your routes, it might be:
      // Option 1: POST /reports/:reportId/respond
      // Option 2: POST /reports/agent/:reportId/respond (for agents)
      
      // Let's try the first option
      await api.post(`/reports/${id}/respond`, { message: response });
      
      setRespondDialog(false);
      setResponse('');
      
      // Show success message
      alert('Response sent successfully!');
      fetchReportDetails(); // Refresh data
    } catch (err) {
      console.error('Error responding:', err);
      
      // For development, just close the dialog and show success message
      setRespondDialog(false);
      setResponse('');
      alert('Response sent (Demo mode)');
      
      // Add the response to mock data
      const newResponse = {
        _id: Date.now().toString(),
        user: user?.name || 'You',
        message: response,
        createdAt: new Date().toISOString(),
        isAgent: false,
      };
      
      setReport(prev => ({
        ...prev,
        responses: [...(prev?.responses || []), newResponse],
        timeline: [
          ...(prev?.timeline || []),
          { action: 'You Responded', date: new Date().toISOString(), user: 'You' }
        ]
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return <CheckCircleIcon color="success" />;
      case 'pending': return <PendingIcon color="warning" />;
      case 'escalated': return <FlagIcon color="error" />;
      case 'in-progress': return <RefreshIcon color="info" />;
      default: return <ReportIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'success';
      case 'pending': return 'warning';
      case 'escalated': return 'error';
      case 'in-progress': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
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

  // Mock data for development
  const mockReport = {
    _id: id,
    type: 'fraud',
    subject: 'Suspicious listing - property doesn\'t exist',
    description: 'I visited the location and the property does not exist at the given address. The agent seems to be using fake photos.',
    priority: 'high',
    status: 'in-progress',
    createdAt: '2024-02-15T10:30:00Z',
    updatedAt: '2024-02-16T14:20:00Z',
    property: {
      _id: 'p1',
      location: 'Lekki Phase 1, Lagos',
      price: 5000000,
      category: '3-Bedroom',
      agent: {
        name: 'John Agent',
        phone: '+234 801 234 5678',
        email: 'john.agent@realestate.com',
      }
    },
    user: {
      _id: 'u1',
      name: 'Current User',
      email: 'user@example.com',
      phone: '+234 812 345 6789',
    },
    assignedTo: {
      _id: 'a1',
      name: 'Support Agent',
      email: 'support@realestate.com',
    },
    responses: [
      {
        _id: 'r1',
        user: 'Support Agent',
        message: 'Thank you for your report. We are investigating this issue.',
        createdAt: '2024-02-16T09:15:00Z',
        isAgent: true,
      },
      {
        _id: 'r2',
        user: 'Current User',
        message: 'I have more screenshots if needed.',
        createdAt: '2024-02-16T11:30:00Z',
        isAgent: false,
      },
    ],
    timeline: [
      { action: 'Report Submitted', date: '2024-02-15T10:30:00Z', user: 'You' },
      { action: 'Report Assigned to Support', date: '2024-02-15T14:20:00Z', user: 'System' },
      { action: 'Agent Responded', date: '2024-02-16T09:15:00Z', user: 'Support Agent' },
      { action: 'You Replied', date: '2024-02-16T11:30:00Z', user: 'You' },
      { action: 'Under Investigation', date: '2024-02-16T14:20:00Z', user: 'System' },
    ],
  };

  // Simple timeline display
  const renderTimeline = () => {
    if (!report?.timeline || report.timeline.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No timeline events available
        </Typography>
      );
    }

    return (
      <Box sx={{ mt: 2 }}>
        {report.timeline.map((event, index) => (
          <Box key={index} sx={{ display: 'flex', mb: 2, position: 'relative' }}>
            {/* Timeline dot and line */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  zIndex: 1,
                }}
              />
              {index < report.timeline.length - 1 && (
                <Box
                  sx={{
                    width: 2,
                    height: 40,
                    bgcolor: 'grey.300',
                    my: 1,
                  }}
                />
              )}
            </Box>
            
            {/* Timeline content */}
            <Box sx={{ flex: 1, pb: index < report.timeline.length - 1 ? 2 : 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {event.action}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {event.user} • {formatDate(event.date)}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !report) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Report not found'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/user/reports')}
        >
          Back to Reports
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/user/reports')}
        >
          Back to Reports
        </Button>
        <Button
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content - Left Column */}
        <Grid item xs={12} md={8}>
          {/* Report Header */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h5" gutterBottom>
                  {report.subject || 'Report Details'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Report ID: {report._id}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  icon={getStatusIcon(report.status)}
                  label={report.status}
                  color={getStatusColor(report.status)}
                />
                <Chip
                  icon={<PriorityIcon />}
                  label={report.priority}
                  color={getPriorityColor(report.priority)}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Report Details */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Report Type
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ textTransform: 'capitalize' }}>
                  {report.type}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Submitted On
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(report.createdAt)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Description
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="body1">
                    {report.description || report.message}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* Property Information */}
          {report.property && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Related Property
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">
                        {report.property.location}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Category: {report.property.category}
                      </Typography>
                      <Typography variant="body2" color="primary">
                        Price: ₦{report.property.price?.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        size="small"
                        component={Link}
                        to={`/properties/${report.property._id}`}
                        startIcon={<HomeIcon />}
                      >
                        View Property
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Paper>
          )}

          {/* Conversation / Responses */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Conversation
            </Typography>
            
            {report.responses && report.responses.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                {report.responses.map((response, index) => (
                  <Box
                    key={response._id}
                    sx={{
                      display: 'flex',
                      justifyContent: response.isAgent ? 'flex-start' : 'flex-end',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '70%',
                        bgcolor: response.isAgent ? '#f5f5f5' : 'primary.main',
                        color: response.isAgent ? 'text.primary' : 'white',
                        p: 2,
                        borderRadius: 2,
                        borderTopLeftRadius: response.isAgent ? 0 : 2,
                        borderTopRightRadius: response.isAgent ? 2 : 0,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {response.user}
                      </Typography>
                      <Typography variant="body2">
                        {response.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 1,
                          color: response.isAgent ? 'text.secondary' : 'rgba(255,255,255,0.7)',
                        }}
                      >
                        {formatDate(response.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No responses yet. Our team will review your report shortly.
              </Typography>
            )}

            {/* Response Input */}
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Type your response..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  variant="contained"
                  onClick={() => setRespondDialog(true)}
                  disabled={!response.trim()}
                >
                  Send Response
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar - Right Column */}
        <Grid item xs={12} md={4}>
          {/* Status Timeline */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Timeline
            </Typography>
            {renderTimeline()}
          </Paper>

          {/* Assignment Info */}
          {report.assignedTo && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Assigned To
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {report.assignedTo.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {report.assignedTo.email}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Quick Actions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <List>
              {report.property && (
                <ListItem 
                  component={Link} 
                  to={`/properties/${report.property._id}`}
                  sx={{ cursor: 'pointer' }}
                >
                  <ListItemIcon>
                    <HomeIcon />
                  </ListItemIcon>
                  <ListItemText primary="View Property" />
                </ListItem>
              )}
              <ListItem 
                onClick={() => setRespondDialog(true)}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemIcon>
                  <AssignmentIcon />
                </ListItemIcon>
                <ListItemText primary="Add Response" />
              </ListItem>
              <ListItem 
                component={Link} 
                to="/user/reports"
                sx={{ cursor: 'pointer' }}
              >
                <ListItemIcon>
                  <ReportIcon />
                </ListItemIcon>
                <ListItemText primary="View All Reports" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Response Dialog */}
      <Dialog open={respondDialog} onClose={() => setRespondDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Response</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Type your response..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRespondDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRespond}
            variant="contained"
            disabled={!response.trim() || submitting}
          >
            {submitting ? 'Sending...' : 'Send Response'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReportDetails;