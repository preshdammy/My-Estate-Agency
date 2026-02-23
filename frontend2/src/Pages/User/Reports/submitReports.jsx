import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Divider,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Report as ReportIcon,
  Send as SendIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import api from '../../../services/api/apiClient';

const steps = ['Select Property', 'Report Details', 'Review & Submit'];

const SubmitReport = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    apartmentId: '',
    type: 'fraud',
    subject: '',
    message: '',
    priority: 'medium',
  });

  // Fetch apartments on component mount
  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/apartments');
      console.log('Apartments from DB:', response.data);
      
      if (response.data && response.data.length > 0) {
        setApartments(response.data);
      } else {
        setApartments([]);
        setError('No apartments available to report');
      }
    } catch (err) {
      console.error('Error fetching apartments:', err);
      setError('Failed to load apartments. Please try again later.');
      setApartments([]);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (activeStep === 0) {
      if (!formData.apartmentId) {
        newErrors.apartmentId = 'Please select an apartment';
      }
    }

    if (activeStep === 1) {
      if (!formData.type) {
        newErrors.type = 'Please select a report type';
      }
      if (!formData.subject) {
        newErrors.subject = 'Subject is required';
      }
      if (!formData.message) {
        newErrors.message = 'Message is required';
      } else if (formData.message.length < 10) {
        newErrors.message = 'Please provide more details (at least 10 characters)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setSubmitting(true);
    try {
      // Prepare data according to your backend schema
      const reportData = {
        apartmentId: formData.apartmentId,
        type: formData.type,
        subject: formData.subject,
        message: formData.message,
        priority: formData.priority,
      };

      console.log('Submitting report:', reportData);
      
      // Submit to your reports endpoint
      const response = await api.post('/reports', reportData);
      
      console.log('Report submitted:', response.data);

      setSnackbar({
        open: true,
        message: 'Report submitted successfully! Our team will review it shortly.',
        severity: 'success',
      });

      // Redirect to my reports page after success
      setTimeout(() => {
        navigate('/user/reports');
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting report:', err.response?.data || err.message);
      
      // Show actual error message from backend
      const errorMessage = err.response?.data?.message || 'Failed to submit report. Please try again.';
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Select the apartment you want to report
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <FormControl fullWidth error={!!errors.apartmentId} sx={{ mb: 3 }}>
                <InputLabel>Select Apartment</InputLabel>
                <Select
                  name="apartmentId"
                  value={formData.apartmentId}
                  label="Select Apartment"
                  onChange={handleChange}
                >
                  {apartments.map((apartment) => (
                    <MenuItem key={apartment._id} value={apartment._id}>
                      {apartment.location}
                    </MenuItem>
                  ))}
                </Select>
                {errors.apartmentId && (
                  <Typography variant="caption" color="error">
                    {errors.apartmentId}
                  </Typography>
                )}
              </FormControl>
            )}

            {formData.apartmentId && !loading && (
              <Alert severity="info" sx={{ mt: 2 }}>
                You are reporting: {apartments.find(a => a._id === formData.apartmentId)?.location}
              </Alert>
            )}
            
            {!loading && apartments.length === 0 && error && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Provide details about your report
            </Typography>

            <FormControl fullWidth error={!!errors.type} sx={{ mb: 3 }}>
              <InputLabel>Report Type</InputLabel>
             <Select
                name="type"
                value={formData.type}
                label="Report Type"
                onChange={handleChange}
              >
                <MenuItem value="fraud">Suspected Fraud / Scam</MenuItem>
                <MenuItem value="safety">Safety Concern</MenuItem>
                <MenuItem value="condition">Poor Condition</MenuItem>
                <MenuItem value="noise">Noise Complaint</MenuItem>
                <MenuItem value="maintenance">Maintenance Issue</MenuItem>
                <MenuItem value="general">General Complaint</MenuItem>
                <MenuItem value="other">Other Issue</MenuItem>
              </Select>
              {errors.type && (
                <Typography variant="caption" color="error">
                  {errors.type}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              error={!!errors.subject}
              helperText={errors.subject}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              error={!!errors.message}
              helperText={errors.message || 'Please provide as much detail as possible'}
              multiline
              rows={4}
              sx={{ mb: 3 }}
            />

            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Priority</FormLabel>
              <RadioGroup
                row
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <FormControlLabel value="low" control={<Radio />} label="Low" />
                <FormControlLabel value="medium" control={<Radio />} label="Medium" />
                <FormControlLabel value="high" control={<Radio />} label="High" />
                <FormControlLabel value="urgent" control={<Radio />} label="Urgent" />
              </RadioGroup>
            </FormControl>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="warning.main">
              Review Your Report
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      Apartment
                    </Typography>
                    <Typography variant="body2">
                      {apartments.find(a => a._id === formData.apartmentId)?.location || 'Selected apartment'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      Report Type
                    </Typography>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {formData.type}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary">
                      Priority
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        textTransform: 'capitalize',
                        color: formData.priority === 'urgent' ? 'error.main' : 
                               formData.priority === 'high' ? 'warning.main' : 
                               formData.priority === 'medium' ? 'info.main' : 'success.main'
                      }}
                    >
                      {formData.priority}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Subject
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {formData.subject}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Message
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {formData.message}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Alert severity="warning">
              <Typography variant="body2">
                <strong>Please Note:</strong> False reports may result in account suspension.
                Make sure the information provided is accurate.
              </Typography>
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <WarningIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Submit a Report
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Help us maintain quality by reporting any issues with apartments or agents
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form */}
        <Box sx={{ minHeight: 300 }}>
          {getStepContent(activeStep)}
        </Box>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="error"
              onClick={handleSubmit}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SubmitReport;