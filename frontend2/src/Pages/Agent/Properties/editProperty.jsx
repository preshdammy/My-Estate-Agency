import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Save as SaveIcon,
} from '@mui/icons-material';
import api from '../../../services/api/apiClient';

const steps = ['Basic Information', 'Property Details', 'Features & Images', 'Review'];

const EditProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get property ID from URL
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
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
  const [existingImages, setExistingImages] = useState([]); // URLs of existing images
  const [newImages, setNewImages] = useState([]); // New image files to upload
  const [newImagePreviews, setNewImagePreviews] = useState([]); // Previews for new images
  const [imagesToDelete, setImagesToDelete] = useState([]); // Images to delete from server

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

  // Fetch property data on component mount
  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/apartments/${id}`);
      const property = response.data;
      
      console.log('Property details:', property);
      
      // Extract filename from image URLs if they're full URLs
      let imageFilenames = [];
      if (property.images && property.images.length > 0) {
        imageFilenames = property.images.map(url => {
          // If it's a full URL, extract the filename
          if (url.includes('uploads/apartments/')) {
            return url.split('uploads/apartments/').pop();
          }
          return url;
        });
      }
      
      setFormData({
        location: property.location || '',
        price: property.price || '',
        category: property.category || '',
        bedrooms: property.bedrooms || '',
        bathrooms: property.bathrooms || '',
        area: property.size || property.area || '',
        description: property.description || '',
        features: property.amenities || property.features || [],
        availability: property.availability ? 'available' : 'rented',
      });
      
      setExistingImages(property.images || []);
      
    } catch (err) {
      console.error('Error fetching property:', err);
      setFetchError('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
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
  const handleAddFeature = () => {
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

  // Handle new image upload
const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);
  const previews = files.map((file) => URL.createObjectURL(file));

  setNewImages((prev) => [...prev, ...files]);
  setNewImagePreviews((prev) => [...prev, ...previews]);
};

  // Remove existing image (mark for deletion)
  const handleRemoveExistingImage = (index) => {
    const imageToDelete = existingImages[index];
    setImagesToDelete([...imagesToDelete, imageToDelete]);
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  // Remove new image
  const handleRemoveNewImage = (index) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newImagePreviews[index]);
    
    setNewImages(newImages.filter((_, i) => i !== index));
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (activeStep !== steps.length - 1) {
      console.log('Not on review page, preventing submit');
      return;
    }
    
    if (!validateStep()) return;

    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      
      // Add all text fields
      formDataToSend.append('location', formData.location.trim());
      formDataToSend.append('price', String(formData.price));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('availability', formData.availability === 'available');
      formDataToSend.append('bedrooms', formData.bedrooms);
      formDataToSend.append('bathrooms', formData.bathrooms);
      formDataToSend.append('size', formData.area);
      
      // Add features as JSON string
      if (formData.features && formData.features.length > 0) {
        formDataToSend.append('amenities', JSON.stringify(formData.features));
      }
      
      const keptFilenames = (existingImages || []).map((img) => {
        // if it is a full url, extract filename
        if (typeof img === "string" && img.includes("uploads/apartments/")) {
            return img.split("uploads/apartments/").pop();
        }
        return img; // already a filename
        });

        formDataToSend.append("keepImages", JSON.stringify(keptFilenames));
            
      // Add new images
      newImages.forEach((image) => {
        formDataToSend.append('images', image); // ✅ must match multer field name
        });

      console.log('Updating apartment:', Object.fromEntries(formDataToSend));
      
      const response = await api.put(`/apartments/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Apartment updated:', response.data);

      setSnackbar({
        open: true,
        message: 'Property updated successfully!',
        severity: 'success',
      });

      // Redirect to agent properties page after success
      setTimeout(() => {
        navigate('/agent/properties');
      }, 2000);
      
    } catch (err) {
      console.error('Error updating apartment:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to update property',
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
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddFeature}
                  startIcon={<AddIcon />}
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
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Current Images
                  </Typography>
                  <Grid container spacing={2}>
                    {existingImages.map((image, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Card sx={{ position: 'relative' }}>
                          <CardMedia
                            component="img"
                            height="120"
                            image={image}
                            alt={`Property image ${index + 1}`}
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
                            onClick={() => handleRemoveExistingImage(index)}
                          >
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Upload New Images */}
              <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    sx={{ mb: 2 }}
                    >
                    Upload New Images (replaces old)
                    <input
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                    </Button>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    If you upload new images, they will replace all current images for this property.
                    </Typography>
              
              {/* New Image Previews */}
              {newImagePreviews.length > 0 && (
                <Grid container spacing={2}>
                  {newImagePreviews.map((preview, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Card sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="120"
                          image={preview}
                          alt={`New image ${index + 1}`}
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
                          onClick={() => handleRemoveNewImage(index)}
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
              Review Your Changes
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

                {/* Images summary */}
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Images
                  </Typography>
                  <Typography variant="body2">
                    {existingImages.length} existing images, {newImages.length} new images
                    {imagesToDelete.length > 0 && `, ${imagesToDelete.length} will be deleted`}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Alert severity="info">
              <Typography variant="body2">
                <strong>Review your changes carefully.</strong> All updates will be saved when you click "Save Changes".
              </Typography>
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{fetchError}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/agent/properties')}
          sx={{ mt: 2 }}
        >
          Back to Properties
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/agent/properties')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          Edit Property
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
        <form onSubmit={handleSubmit}>
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
                startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                size="large"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
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

export default EditProperty;