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
  Card,
  CardContent,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import api from '../../../services/api/apiClient';

const MyInspections = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/inspections');
      setInspections(response.data);
    } catch (err) {
      console.error('Error fetching inspections:', err);
      // Mock data for development
      setInspections(mockInspections);
    } finally {
      setLoading(false);
    }
  };

  // Mock data
  const mockInspections = [
    {
      _id: '1',
      property: {
        _id: 'p1',
        location: 'Lekki Phase 1, Lagos',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500',
        agent: { name: 'John Agent' },
      },
      date: '2024-02-15',
      time: '10:00 AM',
      status: 'approved',
      notes: 'Looking forward to seeing the property',
      createdAt: '2024-02-10',
    },
    {
      _id: '2',
      property: {
        _id: 'p2',
        location: 'Victoria Island, Lagos',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500',
        agent: { name: 'Jane Agent' },
      },
      date: '2024-02-20',
      time: '2:00 PM',
      status: 'pending',
      notes: 'Interested in the duplex layout',
      createdAt: '2024-02-12',
    },
    {
      _id: '3',
      property: {
        _id: 'p3',
        location: 'Ikeja, Lagos',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
        agent: { name: 'Mike Agent' },
      },
      date: '2024-02-05',
      time: '11:00 AM',
      status: 'rejected',
      notes: 'Agent unavailable on selected date',
      createdAt: '2024-02-01',
    },
    {
      _id: '4',
      property: {
        _id: 'p4',
        location: 'Surulere, Lagos',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500',
        agent: { name: 'Sarah Agent' },
      },
      date: '2024-02-18',
      time: '3:00 PM',
      status: 'completed',
      notes: 'Inspection completed, property looks great',
      createdAt: '2024-02-08',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon />;
      case 'pending': return <PendingIcon />;
      case 'rejected': return <CancelIcon />;
      case 'completed': return <ScheduleIcon />;
      default: return <CalendarIcon />;
    }
  };

  const getStatusSteps = (status) => {
    const steps = ['Requested', 'Agent Review', status === 'approved' ? 'Approved' : 'Scheduled'];
    const activeStep = status === 'pending' ? 1 : status === 'approved' ? 2 : 0;
    
    return { steps, activeStep };
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
        My Inspection Requests
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Track the status of your property inspection requests
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {inspections.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No inspection requests yet
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
      ) : (
        <Grid container spacing={3}>
          {inspections.map((inspection) => (
            <Grid item xs={12} key={inspection._id}>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    {/* Property Image & Info */}
                    <Grid item xs={12} md={3}>
                      <Box
                        component="img"
                        src={inspection.property.image}
                        alt={inspection.property.location}
                        sx={{
                          width: '100%',
                          height: isMobile ? 200 : 150,
                          objectFit: 'cover',
                          borderRadius: 1,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={9}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {inspection.property.location}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Agent: {inspection.property.agent.name}
                          </Typography>
                        </Box>
                        <Chip
                          icon={getStatusIcon(inspection.status)}
                          label={inspection.status.toUpperCase()}
                          color={getStatusColor(inspection.status)}
                        />
                      </Box>

                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Request Date
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(inspection.createdAt)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Preferred Date
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(inspection.date)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Preferred Time
                          </Typography>
                          <Typography variant="body2">
                            {inspection.time}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Status
                          </Typography>
                          <Typography variant="body2" color={`${getStatusColor(inspection.status)}.main`}>
                            {inspection.status}
                          </Typography>
                        </Grid>
                      </Grid>

                      {/* Status Stepper */}
                      <Box sx={{ mt: 2 }}>
                        <Stepper
                          activeStep={getStatusSteps(inspection.status).activeStep}
                          orientation="horizontal"
                          alternativeLabel={!isMobile}
                        >
                          {getStatusSteps(inspection.status).steps.map((label) => (
                            <Step key={label}>
                              <StepLabel>{label}</StepLabel>
                            </Step>
                          ))}
                        </Stepper>
                      </Box>

                      {inspection.notes && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Your Notes
                          </Typography>
                          <Typography variant="body2">
                            {inspection.notes}
                          </Typography>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                        <Button
                          size="small"
                          component={Link}
                          to={`/properties/${inspection.property._id}`}
                        >
                          View Property
                        </Button>
                        {inspection.status === 'approved' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                          >
                            Add to Calendar
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MyInspections;