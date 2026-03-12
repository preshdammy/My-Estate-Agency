import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import api from '../../../services/api/apiClient';

const AgentProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Use the correct endpoint from your routes
      const response = await api.get('/agents/apartments');
      console.log('Properties fetched:', response.data);
      setProperties(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await api.delete(`/apartments/${propertyId}`);
        // Refresh the list after deletion
        fetchProperties();
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          My Properties
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/agent/properties/add"
          startIcon={<AddIcon />}
        >
          Add New Property
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!loading && properties.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No properties listed yet
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/agent/properties/add"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            List Your First Property
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {properties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property._id}>
              <Card>
                <CardMedia
                    component="img"
                    height="200"
                   image={
                      property.images?.[0]
                        ? property.images[0].startsWith('http')
                          ? property.images[0]
                          : `http://localhost:5006/uploads/apartments/${property.images[0]}`
                        : '/no-image.jpg'
                    }
                    />
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {property.location}
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {formatPrice(property.price)}
                  </Typography>
                  <Chip
                    label={property.category}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {property.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
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
                      onClick={() => handleDelete(property._id)}
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
    </Container>
  );
};

export default AgentProperties;
