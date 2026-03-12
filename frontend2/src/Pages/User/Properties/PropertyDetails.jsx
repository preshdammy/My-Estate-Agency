import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Rating,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  IconButton,
  Breadcrumbs,
  Link as MuiLink,
  Tab,
  Tabs,
  Skeleton,
  Tooltip,
  MenuItem,  // ← This was missing
  Select,    // ← You might need this too
  FormControl, // ← And this
  InputLabel,  // ← And this
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Home as HomeIcon,
  Bed as BedIcon,
  Bathtub as BathIcon,
  SquareFoot as AreaIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Report as ReportIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import api from '../../../services/api/apiClient';

// Tab Panel Component
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`property-tabpanel-${index}`}
    aria-labelledby={`property-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, token } = useSelector((state) => state.auth);

    const isAuthenticated = !!token;
    const isUser = user?.role === "user";
  // State
  const [property, setProperty] = useState(null);
  const [agentCount, setAgentCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  
  // Inspection Dialog
  const [inspectionDialog, setInspectionDialog] = useState(false);
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionTime, setInspectionTime] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Report Dialog
  const [reportDialog, setReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  
  // Share Dialog
  const [shareDialog, setShareDialog] = useState(false);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch property details
  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

 const fetchPropertyDetails = async () => {
  setLoading(true);
  setError(null);

  try {
    
    const response = await api.get(`/apartments/${id}`);
    const apt = response.data;

    console.log("Apartment response:", response.data);

    setProperty(apt);

    // 👇 ADD THIS RIGHT AFTER setProperty
        if (apt?.agent?._id) {
      try {
        console.log("Agent ID:", apt.agent._id);

        const res = await api.get(`/apartments/agent/${apt.agent._id}`);

        console.log("Agent apartments response:", res.data);

        setAgentCount(
          Array.isArray(res.data.apartments)
            ? res.data.apartments.length
            : 0
        );

      } catch (err) {
        console.error("Error fetching agent listings:", err);
        setAgentCount(null);
      }
    }

    } catch (err) {
      console.error('Error fetching property:', err);
      setProperty(mockProperty);
    } finally {
      setLoading(false);
    }
  };
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please login to save properties',
        severity: 'warning',
      });
      return;
    }

    setIsFavorite(!isFavorite);
    setSnackbar({
      open: true,
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      severity: 'success',
    });
  };

 const handleRequestInspection = () => {
  if (!token) {
    setSnackbar({
      open: true,
      message: "Please login to request inspection",
      severity: "warning",
    });
    return;
  }

  if (user?.role !== "user") {
    setSnackbar({
      open: true,
      message: "Agents cannot request inspections",
      severity: "error",
    });
    return;
  }

  setInspectionDialog(true);
 };

  const handleSubmitInspection = async () => {
  if (!inspectionDate || !inspectionTime) {
    setSnackbar({
      open: true,
      message: "Please select date and time",
      severity: "error",
    });
    return;
  }

  try {
    setSubmitting(true);

    await api.post("/inspections/request", {
      apartmentId: property._id,
      date: inspectionDate,
      time: inspectionTime,
      notes: inspectionNotes,
    });

    setSnackbar({
      open: true,
      message: "Inspection request sent!",
      severity: "success",
    });

    setInspectionDialog(false);

  } catch (err) {
    setSnackbar({
      open: true,
      message: "Failed to request inspection",
      severity: "error",
    });
  } finally {
    setSubmitting(false);
  }
};

  const handleReportSubmit = () => {
    if (!reportReason) {
      setSnackbar({
        open: true,
        message: 'Please select a reason',
        severity: 'error',
      });
      return;
    }

    setReportDialog(false);
    setSnackbar({
      open: true,
      message: 'Report submitted successfully',
      severity: 'success',
    });
    setReportReason('');
    setReportDetails('');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.location,
        text: property?.description,
        url: window.location.href,
      }).catch(() => {
        setShareDialog(true);
      });
    } else {
      setShareDialog(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareDialog(false);
    setSnackbar({
      open: true,
      message: 'Link copied to clipboard',
      severity: 'success',
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={20} width="60%" />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !property) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Property not found'}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/properties')}
          startIcon={<ArrowBackIcon />}
        >
          Back to Properties
        </Button>
      </Container>
    );
  }

  const statusLabel = property?.availability ? 'Available' : 'Rented';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink
          component="button"
          onClick={() => navigate('/')}
          underline="hover"
          color="inherit"
        >
          Home
        </MuiLink>
        <MuiLink
          component="button"
          onClick={() => navigate('/properties')}
          underline="hover"
          color="inherit"
        >
          Properties
        </MuiLink>
        <Typography color="text.primary">Property Details</Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Grid container spacing={4}>
        {/* Main Content - Left Column */}
        <Grid item xs={12} md={8}>
          {/* Image Gallery */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              {/* Main Image */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 400,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  borderRadius: 1,
                }}
                onClick={() => setGalleryOpen(true)}
              >
                <img
                  src={property.images?.[selectedImage] || property.images?.[0]}
                  alt={property.location}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                
                {/* Image Count Badge */}
                <Chip
                  icon={<ImageIcon />}
                  label={`${property.images?.length || 1} Photos`}
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    '& .MuiChip-icon': { color: 'white' },
                  }}
                />
              </Box>

              {/* Thumbnail Navigation */}
              {property.images && property.images.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto', pb: 1 }}>
                  {property.images.map((img, index) => (
                    <Box
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      sx={{
                        width: 80,
                        height: 60,
                        flexShrink: 0,
                        cursor: 'pointer',
                        border: index === selectedImage ? '2px solid primary.main' : 'none',
                        borderRadius: 1,
                        overflow: 'hidden',
                        opacity: index === selectedImage ? 1 : 0.6,
                        '&:hover': { opacity: 1 },
                      }}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Paper>

          {/* Property Title & Actions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {property.location}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<LocationIcon />}
                    label={property.location?.split(',')[0] || 'Location'}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={property.category || 'Category'}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  
                  
                  <Chip
                     label={statusLabel}
                      size="small"
                      color={property.availability ? 'success' : 'error'}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Listed: {property.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    👁️ {property.totalViews || 0} views
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                  <IconButton onClick={toggleFavorite} color={isFavorite ? 'error' : 'default'}>
                    {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share property">
                  <IconButton onClick={handleShare}>
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Report property">
                  <IconButton onClick={() => setReportDialog(true)} color="error">
                    <ReportIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Typography variant="h4" color="primary" sx={{ mt: 2 }}>
              {formatPrice(property.price || 0)}
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                / year
              </Typography>
            </Typography>
          </Paper>

          {/* Key Features */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Key Features
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <BedIcon color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="body2">{property.bedrooms || 0} Bedrooms</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <BathIcon color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="body2">{property.bathrooms || 0} Bathrooms</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <AreaIcon color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="body2">{property.size ? `${property.size} m²` : 'N/A'}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Tabs */}
          <Paper sx={{ p: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant={isMobile ? 'fullWidth' : 'standard'}>
              <Tab label="Description" />
              <Tab label="Features" />
              <Tab label="Nearby Places" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="body1" paragraph style={{ whiteSpace: 'pre-line' }}>
                {property.description || 'No description available.'}
              </Typography>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={2}>
                {property.amenities && property.amenities.length > 0 ? (
                  property.amenities.map((feature, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      No features listed.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <List>
                {property.nearby && property.nearby.length > 0 ? (
                  property.nearby.map((place, index) => (
                    <ListItem key={index} divider={index < property.nearby.length - 1}>
                      <ListItemText
                        primary={place.name || 'Place'}
                        secondary={`${place.distance || 'N/A'} away`}
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No nearby places listed." />
                  </ListItem>
                )}
              </List>
            </TabPanel>
          </Paper>
        </Grid>

        {/* Sidebar - Right Column */}
        <Grid item xs={12} md={4}>
          {/* Agent Card */}
          {property.agent && (
            <Paper sx={{ p: 3, mb: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Contact Agent
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  src={property.agent.avatar}
                  sx={{ width: 60, height: 60 }}
                />
                <Box>
                  <Typography variant="subtitle1">{property.agent.name || 'Agent'}</Typography>
                  {property.agent.rating && (
                    <Rating value={property.agent.rating} readOnly size="small" />
                  )}
                 <Typography variant="caption" color="text.secondary">
                    {agentCount === null ? 'Loading...' : `${agentCount} properties`}
                  </Typography>
                </Box>
              </Box>

              <List>
                {property.agent.phone && (
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Phone" secondary={property.agent.phone} />
                  </ListItem>
                )}
                {property.agent.email && (
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Email" secondary={property.agent.email} />
                  </ListItem>
                )}
                {property.agent.joined && (
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Member since"
                      secondary={new Date(property.agent.joined).toLocaleDateString()}
                    />
                  </ListItem>
                )}
              </List>

              <Divider sx={{ my: 2 }} />

              {isAuthenticated && isUser && (
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<CalendarIcon />}
                  onClick={handleRequestInspection}
                >
                  Request Inspection
                </Button>
              )}
              
              {property.agent.email && (
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<EmailIcon />}
                  href={`mailto:${property.agent.email}`}
                >
                  Send Message
                </Button>
              )}
            </Paper>
          )}

          {/* Quick Info */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Property Overview
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Property ID" secondary={property._id || 'N/A'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Category" secondary={property.category || 'N/A'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Furnished" secondary={property.furnished ? 'Yes' : 'No'} />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Available from"
                  secondary={property.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'N/A'}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Image Gallery Dialog */}
      <Dialog
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogContent sx={{ p: 0, position: 'relative', bgcolor: 'black' }}>
          <IconButton
            onClick={() => setGalleryOpen(false)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              zIndex: 1,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {property.images && property.images.length > 1 && (
              <>
                <IconButton
                  onClick={() => setSelectedImage(prev => Math.max(0, prev - 1))}
                  disabled={selectedImage === 0}
                  sx={{
                    position: 'absolute',
                    left: 16,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    '&.Mui-disabled': { opacity: 0.3 },
                  }}
                >
                  <NavigateBeforeIcon />
                </IconButton>

                <IconButton
                  onClick={() => setSelectedImage(prev => Math.min(property.images.length - 1, prev + 1))}
                  disabled={selectedImage === property.images.length - 1}
                  sx={{
                    position: 'absolute',
                    right: 16,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    '&.Mui-disabled': { opacity: 0.3 },
                  }}
                >
                  <NavigateNextIcon />
                </IconButton>
              </>
            )}

            <img
              src={property.images?.[selectedImage] || property.images?.[0]}
              alt={`Gallery ${selectedImage + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
              }}
            />
          </Box>

          <Box sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)' }}>
            <Typography variant="body2" sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)', px: 2, py: 1, borderRadius: 2 }}>
              {selectedImage + 1} / {property.images?.length || 1}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Inspection Request Dialog */}
      <Dialog open={inspectionDialog} onClose={() => setInspectionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Property Inspection</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select your preferred date and time for inspection
          </Typography>

          <TextField
            fullWidth
            type="date"
            label="Preferred Date"
            value={inspectionDate}
            onChange={(e) => setInspectionDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            type="time"
            label="Preferred Time"
            value={inspectionTime}
            onChange={(e) => setInspectionTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label="Additional Notes"
            value={inspectionNotes}
            onChange={(e) => setInspectionNotes(e.target.value)}
            multiline
            rows={3}
            placeholder="Any specific questions or requirements?"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInspectionDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitInspection}
            variant="contained"
            disabled={!inspectionDate || !inspectionTime || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

            {/* Report Dialog */}
        <Dialog open={reportDialog} onClose={() => setReportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report Property</DialogTitle>
        <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Help us maintain quality by reporting any issues with this property
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="report-reason-label">Reason for Report</InputLabel>
            <Select
                labelId="report-reason-label"
                value={reportReason}
                label="Reason for Report"
                onChange={(e) => setReportReason(e.target.value)}
                required
            >
                <MenuItem value="fake">Fake Listing</MenuItem>
                <MenuItem value="wrong_info">Wrong Information</MenuItem>
                <MenuItem value="already_sold">Already Sold/Rented</MenuItem>
                <MenuItem value="scam">Suspected Scam</MenuItem>
                <MenuItem value="agent_issue">Agent Behavior</MenuItem>
                <MenuItem value="other">Other</MenuItem>
            </Select>
            </FormControl>

            <TextField
            fullWidth
            label="Additional Details"
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            multiline
            rows={3}
            placeholder="Please provide more details..."
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setReportDialog(false)}>Cancel</Button>
            <Button
            onClick={handleReportSubmit}
            variant="contained"
            color="error"
            disabled={!reportReason}
            >
            Submit Report
            </Button>
        </DialogActions>
        </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialog} onClose={() => setShareDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Property</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Copy the link below to share this property
          </Typography>
          <TextField
            fullWidth
            value={window.location.href}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialog(false)}>Cancel</Button>
          <Button onClick={copyToClipboard} variant="contained">
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>

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

export default PropertyDetails;