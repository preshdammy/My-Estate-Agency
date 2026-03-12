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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Report as ReportIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import api from '../../../services/api/apiClient';

// Tab Panel Component
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`admin-tabpanel-${index}`}
    aria-labelledby={`admin-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAgents: 0,
    totalProperties: 0,
    totalReports: 0,
    pendingAgents: 0,
    openReports: 0,
    totalBookings: 0,
  });

  // Agents
  const [agents, setAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [agentDialog, setAgentDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentAction, setAgentAction] = useState('');

  // Properties
  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);

  // Users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Reports
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportDialog, setReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportStatus, setReportStatus] = useState('');

  // Fetch all data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard stats
      const statsRes = await api.get('/admin/dashboard');
      setStats(statsRes.data);

      // Fetch all data in parallel
      await Promise.all([
        fetchAgents(),
        fetchProperties(),
        fetchUsers(),
        fetchReports()
      ]);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    setAgentsLoading(true);
    try {
      const response = await api.get('/admin/agents');
      setAgents(response.data);
    } catch (err) {
      console.error('Error fetching agents:', err);
    } finally {
      setAgentsLoading(false);
    }
  };

  const fetchProperties = async () => {
    setPropertiesLoading(true);
    try {
      const response = await api.get('/admin/apartments');
      setProperties(response.data);
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setPropertiesLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const response = await api.get('/admin/reports');
      setReports(response.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAgentAction = (agent, action) => {
    setSelectedAgent(agent);
    setAgentAction(action);
    setAgentDialog(true);
  };

  const handleAgentSubmit = async () => {
    try {
      if (agentAction === 'approve') {
        await api.put(`/admin/agents/${selectedAgent._id}/status`, { status: 'approved' });
      } else if (agentAction === 'reject') {
        await api.put(`/admin/agents/${selectedAgent._id}/status`, { status: 'rejected' });
      } else if (agentAction === 'delete') {
        await api.delete(`/admin/agents/${selectedAgent._id}`);
      }
      
      // Refresh data
      fetchAgents();
      fetchDashboardData();
      setAgentDialog(false);
    } catch (err) {
      console.error('Error updating agent:', err);
    }
  };

  const handleReportAction = (report) => {
    setSelectedReport(report);
    setReportStatus(report.status);
    setReportDialog(true);
  };

  const handleReportSubmit = async () => {
    try {
      await api.put(`/admin/reports/${selectedReport._id}/status`, { status: reportStatus });
      
      // Refresh reports
      fetchReports();
      fetchDashboardData();
      setReportDialog(false);
    } catch (err) {
      console.error('Error updating report:', err);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await api.delete(`/apartments/${propertyId}`);
        fetchProperties();
        fetchDashboardData();
      } catch (err) {
        console.error('Error deleting property:', err);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchUsers();
        fetchDashboardData();
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'open': return 'warning';
      case 'resolved': return 'success';
      case 'escalated': return 'error';
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 70, height: 70, bgcolor: 'white', color: '#9c27b0' }}>
            <AdminIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              Welcome back, Admin {user?.name?.split(' ')[0] || ''}! 👋
            </Typography>
            <Typography variant="body1">
              Manage agents, properties, users, and reports from your dashboard.
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
                    Total Users
                  </Typography>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {stats.totalUsers}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <PeopleIcon />
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
                    Total Agents
                  </Typography>
                  <Typography variant="h4" color="secondary.main" fontWeight="bold">
                    {stats.totalAgents}
                  </Typography>
                  <Typography variant="caption" color="warning.main" sx={{ display: 'block' }}>
                    {stats.pendingAgents} pending approval
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                  <PersonIcon />
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
                    Total Properties
                  </Typography>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {stats.totalProperties}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
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
                    Open Reports
                  </Typography>
                  <Typography variant="h4" color={stats.openReports > 0 ? 'error.main' : 'text.primary'} fontWeight="bold">
                    {stats.openReports}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: stats.openReports > 0 ? 'error.main' : 'grey.500', width: 56, height: 56 }}>
                  <ReportIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<PeopleIcon />} label="Agents" />
          <Tab icon={<HomeIcon />} label="Properties" />
          <Tab icon={<PersonIcon />} label="Users" />
          <Tab icon={<ReportIcon />} label="Reports" />
        </Tabs>
      </Paper>

      {/* Agents Tab */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h5" gutterBottom>Agent Management</Typography>

        {agentsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent._id}>
                    <TableCell>{agent.name}</TableCell>
                    <TableCell>{agent.email}</TableCell>
                    <TableCell>{agent.phone}</TableCell>
                    <TableCell>
                      <Chip
                        label={agent.status}
                        color={getStatusColor(agent.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(agent.createdAt)}</TableCell>
                    <TableCell>
                      {agent.status === 'pending' && (
                        <>
                          <Tooltip title="Approve Agent">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleAgentAction(agent, 'approve')}
                            >
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject Agent">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleAgentAction(agent, 'reject')}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {agent.status === 'approved' && (
                        <Tooltip title="Delete Agent">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleAgentAction(agent, 'delete')}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/admin/agents/${agent._id}`}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Properties Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" gutterBottom>Property Management</Typography>

        {propertiesLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Property</TableCell>
                  <TableCell>Agent</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Listed</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property._id}>
                    <TableCell>{property.location}</TableCell>
                    <TableCell>{property.agent?.name || 'N/A'}</TableCell>
                    <TableCell>{formatPrice(property.price)}</TableCell>
                    <TableCell>{property.category}</TableCell>
                    <TableCell>
                      <Chip
                        label={property.availability ? 'Available' : 'Unavailable'}
                        color={property.availability ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(property.createdAt)}</TableCell>
                    <TableCell>
                      <Tooltip title="View Property">
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/properties/${property._id}`}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Property">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteProperty(property._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Users Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" gutterBottom>User Management</Typography>

        {usersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <Tooltip title="Delete User">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Reports Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h5" gutterBottom>Report Management</Typography>

        {reportsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
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
                      <Tooltip title="Update Status">
                        <IconButton
                          size="small"
                          onClick={() => handleReportAction(report)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/admin/reports/${report._id}`}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      {/* Agent Action Dialog */}
      <Dialog open={agentDialog} onClose={() => setAgentDialog(false)}>
        <DialogTitle>
          {agentAction === 'approve' ? 'Approve Agent' : 
           agentAction === 'reject' ? 'Reject Agent' : 'Delete Agent'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {agentAction} <strong>{selectedAgent?.name}</strong>?
          </Typography>
          {agentAction === 'reject' && (
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
          <Button onClick={() => setAgentDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAgentSubmit}
            variant="contained"
            color={agentAction === 'approve' ? 'success' : 'error'}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Status Dialog */}
      <Dialog open={reportDialog} onClose={() => setReportDialog(false)}>
        <DialogTitle>Update Report Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={reportStatus}
              label="Status"
              onChange={(e) => setReportStatus(e.target.value)}
            >
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="escalated">Escalated</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialog(false)}>Cancel</Button>
          <Button onClick={handleReportSubmit} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;