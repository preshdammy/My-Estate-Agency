import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardMedia,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  PriceChange as PriceIcon,
  Home as HomeIcon,
  Description as DescriptionIcon,
  Bed as BedIcon,
  Bathtub as BathIcon,
  SquareFoot as AreaIcon,
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import api from '../../../services/api/apiClient';

const steps = ['Basic Information', 'Property Details', 'Features & Images', 'Review'];

const AddProperty = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isReviewPage, setIsReviewPage] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    location: '',
    price: '',
    category: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    description: '',
    features: [],
    availability: 'available',
  });

  // Features input
  const [newFeature, setNewFeature] = useState('');
  
  // Images state
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Categories from your apartment model
  const categories = [
    'Studio',
    '1-Bedroom',
    '2-Bedroom',
    '3-Bedroom',
    '4-Bedroom',
    'Duplex',
    'Penthouse',
    'Terrace',
    'Bungalow',
  ];

  // Availability options
  const availabilityOptions = [
    { value: 'available', label: 'Available', color: 'success' },
    { value: 'rented', label: 'Rented', color: 'error' },
    { value: 'pending', label: 'Pending', color: 'warning' },
  ];

  // Validate current step
  const validateStep = () => {
    const newErrors = {};

    if (activeStep === 0) {
      if (!formData.location) newErrors.location = 'Location is required';
      if (!formData.price) newErrors.price = 'Price is required';
      else if (isNaN(formData.price) || formData.price <= 0) {
        newErrors.price = 'Please enter a valid price';
      }
      if (!formData.category) newErrors.category = 'Category is required';
    }

    if (activeStep === 1) {
      if (!formData.bedrooms) newErrors.bedrooms = 'Number of bedrooms is required';
      else if (isNaN(formData.bedrooms) || formData.bedrooms < 0) {
        newErrors.bedrooms = 'Please enter a valid number';
      }
      if (!formData.bathrooms) newErrors.bathrooms = 'Number of bathrooms is required';
      else if (isNaN(formData.bathrooms) || formData.bathrooms < 0) {
        newErrors.bathrooms = 'Please enter a valid number';
      }
      if (!formData.area) newErrors.area = 'Area is required';
      else if (isNaN(formData.area) || formData.area <= 0) {
        newErrors.area = 'Please enter a valid area';
      }
      if (!formData.description) newErrors.description = 'Description is required';
      else if (formData.description.length < 20) {
        newErrors.description = 'Description must be at least 20 characters';
      }
    }

    if (activeStep === 2) {
      if (images.length === 0) {
        newErrors.images = 'At least one image is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  // const handleNext = () => {
  //   if (validateStep()) {
  //     setActiveStep((prev) => prev + 1);
  //   }
  // };

 // Add this state with your other states

// Update your handleNext function
const handleNext = () => {
  console.log('Current step before validation:', activeStep);
  console.log('Form data:', formData);
  console.log('Errors:', errors);
  
  const isValid = validateStep();
  console.log('Validation result:', isValid);
  
  if (isValid) {
    const nextStep = activeStep + 1;
    console.log('Moving to next step:', nextStep);
    
    // Check if we're moving to the review page (step 3)
    if (nextStep === 3) {
      setIsReviewPage(true);
    }
    
    setActiveStep(nextStep);
  } else {
    console.log('Validation failed, staying on step:', activeStep);
  }
};

  // Handle back step
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Handle form field changes
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

  // Add feature to list
  const handleAddFeature = ()=> {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature('');
    }
  };

  // Remove feature from list
  const handleRemoveFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setImages([...images, ...files]);
    setImagePreviews([...imagePreviews, ...newPreviews]);
    
    // Clear image error if any
    if (errors.images) {
      setErrors({ ...errors, images: '' });
    }
  };

  // Remove image
  const handleRemoveImage = (index) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Handle form submission
 const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (activeStep !== steps.length - 1) {
    console.log('Not on review page, preventing submit');
    return;
  }

   console.log('Manual submit triggered on review page');

  if (!validateStep()) return;

  setSubmitting(true);
  try {
    // Create FormData for multipart/form-data
    const formDataToSend = new FormData();
    
    // Required fields
    formDataToSend.append('location', formData.location);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('availability', formData.availability === 'available');
    
    // Optional fields from your model
    if (formData.bedrooms) formDataToSend.append('bedrooms', formData.bedrooms);
    if (formData.bathrooms) formDataToSend.append('bathrooms', formData.bathrooms);
    if (formData.area) formDataToSend.append('size', formData.area); // 'area' in frontend, 'size' in model
    
    // Features/amenities
    if (formData.features && formData.features.length > 0) {
      formDataToSend.append('amenities', JSON.stringify(formData.features));
    }
    
    // Add images
    images.forEach((image) => {
      formDataToSend.append('images', image);
    });

    console.log('Submitting apartment:', Object.fromEntries(formDataToSend));
    
    const response = await api.post('/apartments', formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Apartment created:', response.data);

    setSnackbar({
      open: true,
      message: 'Property listed successfully!',
      severity: 'success',
    });

    setTimeout(() => {
      navigate('/agent/properties');
    }, 2000);
    
  } catch (err) {
    console.error('Error creating apartment:', err);
    setSnackbar({
      open: true,
      message: err.response?.data?.message || 'Failed to create property',
      severity: 'error',
    });
  } finally {
    setSubmitting(false);
  }
};

  // Get step content
  const getStepContent = (step) => {
  switch (step) {
    case 0:
      return (
        <Box>
          <Typography variant="h6" gutterBottom color="primary">
            Basic Information
          </Typography>
          <Grid container spacing={3}>
            {/* Location */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Property Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                error={!!errors.location}
                helperText={errors.location}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                placeholder="e.g., Lekki Phase 1, Lagos"
              />
            </Grid>

            {/* Price */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price (₦)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                error={!!errors.price}
                helperText={errors.price}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PriceIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.category} required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleChange}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <FormHelperText>{errors.category}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      );

    case 1:
      return (
        <Box>
          <Typography variant="h6" gutterBottom color="primary">
            Property Details
          </Typography>
          <Grid container spacing={3}>
            {/* Bedrooms */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bedrooms"
                name="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleChange}
                error={!!errors.bedrooms}
                helperText={errors.bedrooms}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BedIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Bathrooms */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bathrooms"
                name="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleChange}
                error={!!errors.bathrooms}
                helperText={errors.bathrooms}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BathIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Area */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Area (sq m)"
                name="area"
                type="number"
                value={formData.area}
                onChange={handleChange}
                error={!!errors.area}
                helperText={errors.area}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AreaIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description || 'Minimum 20 characters'}
                multiline
                rows={4}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <DescriptionIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                placeholder="Describe the property, its condition, nearby amenities, etc."
              />
            </Grid>

            {/* Availability */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Availability Status</InputLabel>
                <Select
                  name="availability"
                  value={formData.availability}
                  label="Availability Status"
                  onChange={handleChange}
                >
                  {availabilityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      );

    case 2:
      return (
        <Box>
          <Typography variant="h6" gutterBottom color="primary">
            Features & Images
          </Typography>
          
          {/* Features Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Features & Amenities
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Add a feature (e.g., Swimming Pool, 24/7 Security, Gym)"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();   // 🚨 This stops form submission
                    handleAddFeature();
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={handleAddFeature}
                startIcon={<AddIcon />}
                type="button"
              >
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.features.map((feature, index) => (
                <Chip
                  key={index}
                  label={feature}
                  onDelete={() => handleRemoveFeature(index)}
                  color="primary"
                  variant="outlined"
                />
              ))}
              {formData.features.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No features added yet. Add features above.
                </Typography>
              )}
            </Box>
          </Box>

          {/* Images Section */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Property Images
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              sx={{ mb: 2 }}
            >
              Upload Images
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
            
            {errors.images && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.images}
              </Alert>
            )}
            
            {imagePreviews.length > 0 && (
              <Grid container spacing={2}>
                {imagePreviews.map((preview, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Card sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="120"
                        image={preview}
                        alt={`Preview ${index + 1}`}
                        sx={{ objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(255,255,255,0.8)',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                        }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      );

    case 3:
      return (
        <Box>
          <Typography variant="h6" gutterBottom color="primary">
            Review Your Property
          </Typography>
          
          <Paper sx={{ p: 3, bgcolor: '#f8f9fa', mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.location || 'Not provided'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Price
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.price ? `₦${Number(formData.price).toLocaleString()}` : 'Not provided'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.category || 'Not provided'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ textTransform: 'capitalize' }}>
                  {formData.availability}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">
                  Bedrooms
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.bedrooms || '0'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">
                  Bathrooms
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.bathrooms || '0'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">
                  Area
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.area ? `${formData.area} sq m` : 'Not provided'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body2" paragraph>
                  {formData.description || 'No description provided'}
                </Typography>
              </Grid>
              
              {/* Features */}
              {formData.features && formData.features.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Features
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {formData.features.map((feature, index) => (
                      <Chip
                        key={index}
                        label={feature}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
              )}

              {/* Images */}
              {imagePreviews && imagePreviews.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Images ({imagePreviews.length})
                  </Typography>
                  <Grid container spacing={1} sx={{ mt: 0.5 }}>
                    {imagePreviews.map((preview, index) => (
                      <Grid item xs={3} key={index}>
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: '100%',
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 4,
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Paper>

          <Alert severity="info">
            <Typography variant="body2">
              <strong>Please review your property details carefully.</strong> Once submitted, you can still edit the property later.
            </Typography>
          </Alert>
        </Box>
      );

    default:
      return null;
  }
};
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/agent/properties')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          Add New Property
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form */}
      <form  onSubmit={handleSubmit}
        onKeyPress={(e) => {
          // Prevent form submission on Enter key except on review page
          if (e.key === 'Enter' && activeStep !== steps.length - 1) {
            e.preventDefault();
          }
        }}>
        {/* Form content - steps 0,1,2,3 */}
        <Box sx={{ minHeight: 400 }}>
          {getStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
            type="button"
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
              size="large"
            >
              {submitting ? 'Submitting...' : 'List Property'}
            </Button>
          ) : (
            <Button
              type="button"
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </form>
      </Paper>

      {/* Snackbar for notifications */}
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

export default AddProperty;