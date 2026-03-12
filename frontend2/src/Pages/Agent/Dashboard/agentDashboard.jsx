import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
  Chip,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  Report as ReportIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import api from '../../../services/api/apiClient';

// Tab Panel Component
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`agent-tabpanel-${index}`}
    aria-labelledby={`agent-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    totalProperties: 0,
    pendingInspections: 0,
    totalBookings: 0,
    openReports: 0,
    totalViews: 0,
    totalInquiries: 0,
  });

  // Properties
  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);

  // Inspections
  const [inspections, setInspections] = useState([]);
  const [inspectionsLoading, setInspectionsLoading] = useState(false);
  const [inspectionDialog, setInspectionDialog] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [inspectionAction, setInspectionAction] = useState('');

  // Reports
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportDialog, setReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportResponse, setReportResponse] = useState('');

  // Bookings
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Fetch all data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel
      const [propertiesRes, inspectionsRes, reportsRes, bookingsRes] = await Promise.all([
        api.get('/agents/apartments').catch(err => {
          console.error('Error fetching properties:', err);
          return { data: [] };
        }),
        api.get('/inspections/agent/requests').catch(err => {
          console.error('Error fetching inspections:', err);
          return { data: [] };
        }),
        api.get('/reports/agent/reports').catch(err => {
          console.error('Error fetching reports:', err);
          return { data: [] };
        }),
        api.get('/agents/bookings').catch(err => {
          console.error('Error fetching bookings:', err);
          return { data: [] };
        })
      ]);

      // Extract data from responses
      const propertiesData = propertiesRes.data || [];
      const inspectionsData = inspectionsRes.data || [];
      const reportsData = reportsRes.data || [];
      const bookingsData = bookingsRes.data || [];

      // Update state with fetched data
      setProperties(propertiesData);
      setInspections(inspectionsData);
      setReports(reportsData);
      setBookings(bookingsData);

      // Calculate stats from real data
      const totalProperties = propertiesData.length;
      const pendingInspections = inspectionsData.filter(
          i => i.status === 'pending' || i.status === 'requested'
        ).length;
      const totalBookings = bookingsData.length;
      const openReports = reportsData.filter(r => r.status === 'open' || r.status === 'pending').length;
      const totalViews = propertiesData.reduce((sum, p) => sum + (p.views || 0), 0);
      const totalInquiries = totalBookings + inspectionsData.length;

      setStats({
        totalProperties,
        pendingInspections,
        totalBookings,
        openReports,
        totalViews,
        totalInquiries
      });

      console.log('Dashboard stats from real data:', {
        totalProperties,
        pendingInspections,
        totalBookings,
        openReports,
        totalViews,
        totalInquiries
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInspectionAction = (inspection, action) => {
    setSelectedInspection(inspection);
    setInspectionAction(action);
    setInspectionDialog(true);
  };

  const handleInspectionSubmit = async () => {
    try {
      await api.put(`/inspections/agent/${selectedInspection._id}/status`, {
        status: inspectionAction === 'approve' ? 'approved' : 'rejected'
      });
      
      // Refresh data
      fetchDashboardData();
      setInspectionDialog(false);
    } catch (err) {
      console.error('Error updating inspection:', err);
    }
  };

  const handleReportAction = (report) => {
    setSelectedReport(report);
    setReportDialog(true);
  };

  const handleReportSubmit = async () => {
    try {
      await api.put(`/reports/agent/${selectedReport._id}/respond`, {
        response: reportResponse
      });
      
      // Refresh data
      fetchDashboardData();
      setReportDialog(false);
      setReportResponse('');
    } catch (err) {
      console.error('Error responding to report:', err);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await api.delete(`/apartments/${propertyId}`);
        fetchDashboardData();
      } catch (err) {
        console.error('Error deleting property:', err);
      }
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
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'success';
      case 'rented': return 'error';
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'completed': return 'success';
      case 'confirmed': return 'success';
      case 'open': return 'warning';
      case 'in_progress': return 'info';
      case 'resolved': return 'success';
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 70, height: 70, bgcolor: 'white', color: '#1976d2' }}>
            {user?.name?.charAt(0) || 'A'}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.name?.split(' ')[0] || 'Agent'}! 👋
            </Typography>
            <Typography variant="body1">
              Manage your properties, inspections, and reports from your dashboard.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards */}
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Properties */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Properties
                  </Typography>
                  <Typography variant="h3" color="primary.main" fontWeight="bold">
                    {stats.totalProperties}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
                  <HomeIcon sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Inspections */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Pending Inspections
                  </Typography>
                  <Typography variant="h3" color="warning.main" fontWeight="bold">
                    {stats.pendingInspections}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 60, height: 60 }}>
                  <CalendarIcon sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Bookings */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Bookings
                  </Typography>
                  <Typography variant="h3" color="success.main" fontWeight="bold">
                    {stats.totalBookings}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 60, height: 60 }}>
                  <CheckCircleIcon sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Reports */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Reports
                  </Typography>
                  <Typography variant="h3" color={stats.openReports > 0 ? 'error.main' : 'text.primary'} fontWeight="bold">
                    {stats.openReports}
                  </Typography>
                  {stats.openReports > 0 && (
                    <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 0.5 }}>
                      {stats.openReports} pending review
                    </Typography>
                  )}
                </Box>
                <Avatar sx={{ bgcolor: stats.openReports > 0 ? 'error.main' : 'grey.500', width: 60, height: 60 }}>
                  <ReportIcon sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<HomeIcon />} label="Properties" />
          <Tab icon={<CalendarIcon />} label="Inspections" />
          <Tab icon={<ReportIcon />} label="Reports" />
          <Tab icon={<CheckCircleIcon />} label="Bookings" />
        </Tabs>
      </Paper>

      {/* Properties Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">My Properties</Typography>
          <Button
            variant="contained"
            component={Link}
            to="/agent/properties/add"
            startIcon={<AddIcon />}
          >
            Add New Property
          </Button>
        </Box>

        {propertiesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : properties.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No properties listed yet
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/agent/properties/add"
              sx={{ mt: 2 }}
            >
              List Your First Property
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {properties.map((property) => (
              <Grid item xs={12} md={6} lg={4} key={property._id}>
                <Card>
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={
                        property.images?.[0]
                          ? `http://localhost:5006/uploads/apartments/${property.images[0]}`
                          : 'https://via.placeholder.com/300x200'
                      }
                      alt={property.location}
                      sx={{ height: 200, width: '100%', objectFit: 'cover' }}
                    />
                    <Chip
                      label={property.status || 'available'}
                      color={getStatusColor(property.status)}
                      size="small"
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    />
                  </Box>
                  <CardContent>
                    <Typography variant="h6" noWrap>
                      {property.location}
                    </Typography>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {formatPrice(property.price)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {property.category}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                      <IconButton
                        size="small"
                        component={Link}
                        to={`/properties/${property._id}`}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        component={Link}
                        to={`/agent/properties/edit/${property._id}`}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteProperty(property._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Inspections Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" gutterBottom>Inspection Requests</Typography>

        {inspectionsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : inspections.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No inspection requests yet
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Property</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inspections.map((inspection) => (
                  <TableRow key={inspection._id}>
                    <TableCell>{inspection.apartment?.location || 'N/A'}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{inspection.user?.name || 'N/A'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {inspection.user?.email || ''}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(inspection.date)}</TableCell>
                    <TableCell>
                      <Chip
                        label={inspection.status}
                        color={getStatusColor(inspection.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={inspection.message || 'No notes'}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                          {inspection.message || '—'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {inspection.status === 'pending' && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleInspectionAction(inspection, 'approve')}
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleInspectionAction(inspection, 'reject')}
                          >
                            <CloseIcon />
                          </IconButton>
                        </>
                      )}
                      <IconButton
                        size="small"
                        component={Link}
                        to={`/agent/inspections`}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Reports Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" gutterBottom>Property Reports</Typography>

        {reportsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : reports.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No reports on your properties
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Property</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report._id}>
                    <TableCell>{report.apartment?.location || 'N/A'}</TableCell>
                    <TableCell>{report.user?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={report.reportType || 'general'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={report.message || ''}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                          {report.subject || 'No subject'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.priority || 'medium'}
                        color={getPriorityColor(report.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.status || 'open'}
                        color={getStatusColor(report.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(report.createdAt)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleReportAction(report)}
                        disabled={report.status === 'resolved'}
                      >
                        <MessageIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        component={Link}
                        to={`/agent/reports/${report._id}`}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Bookings Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h5" gutterBottom>Property Bookings</Typography>

        {bookingsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : bookings.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No bookings yet
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Property</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Booking Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>{booking.apartment?.location || 'N/A'}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{booking.user?.name || 'N/A'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {booking.user?.email || ''}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(booking.date)}</TableCell>
                    <TableCell>{formatPrice(booking.amount || 0)}</TableCell>
                    <TableCell>
                      <Chip
                        label={booking.status}
                        color={getStatusColor(booking.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        component={Link}
                        to={`/agent/bookings/${booking._id}`}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Inspection Action Dialog */}
      <Dialog open={inspectionDialog} onClose={() => setInspectionDialog(false)}>
        <DialogTitle>
          {inspectionAction === 'approve' ? 'Approve Inspection' : 'Reject Inspection'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {inspectionAction} the inspection request for{' '}
            <strong>{selectedInspection?.property?.location}</strong>?
          </Typography>
          {inspectionAction === 'reject' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason for rejection"
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInspectionDialog(false)}>Cancel</Button>
          <Button
            onClick={handleInspectionSubmit}
            variant="contained"
            color={inspectionAction === 'approve' ? 'success' : 'error'}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Response Dialog */}
      <Dialog open={reportDialog} onClose={() => setReportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Respond to Report</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom>
            Report from {selectedReport?.user?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {selectedReport?.message}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Response"
            value={reportResponse}
            onChange={(e) => setReportResponse(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialog(false)}>Cancel</Button>
          <Button
            onClick={handleReportSubmit}
            variant="contained"
            disabled={!reportResponse.trim()}
          >
            Send Response
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AgentDashboard;