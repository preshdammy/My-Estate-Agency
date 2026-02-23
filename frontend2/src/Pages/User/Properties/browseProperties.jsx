import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Pagination,
  Slider,
  InputAdornment,
  Divider,
  IconButton,
  Rating,
  Alert,
  Drawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  FavoriteBorder,
  Favorite,
  Visibility as ViewIcon,
  Bed as BedIcon,
  Bathtub as BathIcon,
  SquareFoot as AreaIcon,
} from '@mui/icons-material';
import api from '../../../services/api/apiClient';

const BrowseProperties = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // State
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    category: '',
    bedrooms: '',
    bathrooms: '',
    sortBy: 'newest',
  });

  // Price range slider
  const [priceRange, setPriceRange] = useState([0, 10000000]);

  // Categories
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

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
  ];

  // Fetch properties
  useEffect(() => {
    fetchProperties();
  }, [page, filters.sortBy]);

  // Debounce search to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProperties();
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search, filters.location, filters.category, filters.bedrooms, filters.bathrooms]);

  // Handle price range change
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    }));
  }, [priceRange]);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page,
        limit: 9,
        ...(filters.search && { search: filters.search }),
        ...(filters.location && { location: filters.location }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.category && { category: filters.category }),
        ...(filters.bedrooms && { bedrooms: filters.bedrooms }),
        ...(filters.bathrooms && { bathrooms: filters.bathrooms }),
        sortBy: filters.sortBy,
      });

      const response = await api.get(`/apartments?${params}`);
      
      setProperties(response.data.properties || response.data);
      setTotalPages(response.data.totalPages || Math.ceil(response.data.length / 9));
      setTotalProperties(response.data.total || response.data.length);
      
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again.');
      
      // For demo, use mock data if API fails
      setProperties(mockProperties);
      setTotalPages(3);
      setTotalProperties(mockProperties.length);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development
  const mockProperties = [
    {
      _id: '1',
      location: 'Lekki Phase 1, Lagos',
      price: 5000000,
      category: '3-Bedroom',
      description: 'Beautiful apartment with sea view and modern amenities. Features include 24/7 security, swimming pool, and gym.',
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500'],
      bedrooms: 3,
      bathrooms: 4,
      area: 250,
      agent: { name: 'John Agent', rating: 4.5 },
      status: 'available',
    },
    {
      _id: '2',
      location: 'Victoria Island, Lagos',
      price: 7500000,
      category: 'Duplex',
      description: 'Luxury duplex with pool and garden. Perfect for family living with modern finishes.',
      images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500'],
      bedrooms: 4,
      bathrooms: 5,
      area: 350,
      agent: { name: 'Jane Agent', rating: 4.8 },
      status: 'available',
    },
    {
      _id: '3',
      location: 'Ikeja, Lagos',
      price: 2500000,
      category: 'Studio',
      description: 'Cozy studio apartment perfect for singles or couples. Recently renovated.',
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'],
      bedrooms: 1,
      bathrooms: 1,
      area: 45,
      agent: { name: 'Mike Agent', rating: 4.2 },
      status: 'available',
    },
    {
      _id: '4',
      location: 'Surulere, Lagos',
      price: 3500000,
      category: '2-Bedroom',
      description: 'Well maintained flat in quiet neighborhood. Close to schools and markets.',
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500'],
      bedrooms: 2,
      bathrooms: 2,
      area: 120,
      agent: { name: 'Sarah Agent', rating: 4.6 },
      status: 'available',
    },
    {
      _id: '5',
      location: 'Ajah, Lagos',
      price: 4500000,
      category: '3-Bedroom',
      description: 'Spacious apartment with modern kitchen and en-suite bathrooms.',
      images: ['https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=500'],
      bedrooms: 3,
      bathrooms: 3,
      area: 180,
      agent: { name: 'Peter Agent', rating: 4.3 },
      status: 'available',
    },
    {
      _id: '6',
      location: 'Ibadan, Oyo',
      price: 1500000,
      category: '2-Bedroom',
      description: 'Affordable apartment in developing area. Good for investment.',
      images: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500'],
      bedrooms: 2,
      bathrooms: 2,
      area: 100,
      agent: { name: 'Grace Agent', rating: 4.1 },
      status: 'available',
    },
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleSearch = () => {
    setPage(1);
    fetchProperties();
  };

  const handleReset = () => {
    setFilters({
      search: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      category: '',
      bedrooms: '',
      bathrooms: '',
      sortBy: 'newest',
    });
    setPriceRange([0, 10000000]);
    setPage(1);
    fetchProperties();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (propertyId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setFavorites(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const FilterContent = () => (
    <Box sx={{ p: isMobile ? 2 : 0 }}>
      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search by location or keyword"
        name="search"
        value={filters.search}
        onChange={handleFilterChange}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Location */}
      <TextField
        fullWidth
        label="Location"
        name="location"
        value={filters.location}
        onChange={handleFilterChange}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LocationIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Price Range */}
      <Typography gutterBottom>Price Range (₦)</Typography>
      <Slider
        value={priceRange}
        onChange={handlePriceRangeChange}
        valueLabelDisplay="auto"
        min={0}
        max={10000000}
        step={100000}
        sx={{ mb: 2 }}
        valueLabelFormat={(value) => `₦${value.toLocaleString()}`}
      />
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          size="small"
          label="Min"
          value={priceRange[0]}
          onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
          InputProps={{
            startAdornment: <InputAdornment position="start">₦</InputAdornment>,
          }}
        />
        <TextField
          size="small"
          label="Max"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          InputProps={{
            startAdornment: <InputAdornment position="start">₦</InputAdornment>,
          }}
        />
      </Box>

      {/* Category */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          name="category"
          value={filters.category}
          label="Category"
          onChange={handleFilterChange}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map(cat => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Bedrooms */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Bedrooms</InputLabel>
        <Select
          name="bedrooms"
          value={filters.bedrooms}
          label="Bedrooms"
          onChange={handleFilterChange}
        >
          <MenuItem value="">Any</MenuItem>
          <MenuItem value="1">1+</MenuItem>
          <MenuItem value="2">2+</MenuItem>
          <MenuItem value="3">3+</MenuItem>
          <MenuItem value="4">4+</MenuItem>
        </Select>
      </FormControl>

      {/* Bathrooms */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Bathrooms</InputLabel>
        <Select
          name="bathrooms"
          value={filters.bathrooms}
          label="Bathrooms"
          onChange={handleFilterChange}
        >
          <MenuItem value="">Any</MenuItem>
          <MenuItem value="1">1+</MenuItem>
          <MenuItem value="2">2+</MenuItem>
          <MenuItem value="3">3+</MenuItem>
          <MenuItem value="4">4+</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button 
          variant="contained" 
          onClick={handleSearch}
          fullWidth
        >
          Apply Filters
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleReset}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Browse Properties
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find your dream home from our wide selection of properties
        </Typography>
      </Box>

      {/* Mobile Filter Button */}
      {isMobile && (
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={() => setMobileFilterOpen(true)}
          sx={{ mb: 2 }}
          fullWidth
        >
          Show Filters
        </Button>
      )}

      <Grid container spacing={3}>
        {/* Filters Sidebar - Desktop */}
        {!isMobile && (
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <FilterContent />
            </Paper>
          </Grid>
        )}

        {/* Mobile Filter Drawer */}
        <Drawer
          anchor="left"
          open={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
        >
          <Box sx={{ width: 280, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Filters</Typography>
              <IconButton onClick={() => setMobileFilterOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <FilterContent />
          </Box>
        </Drawer>

        {/* Properties Grid */}
        <Grid item xs={12} md={9}>
          {/* Sort and Results Count */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {properties.length} of {totalProperties} properties
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  name="sortBy"
                  value={filters.sortBy}
                  label="Sort By"
                  onChange={handleFilterChange}
                >
                  {sortOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Paper>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
            {/* Properties Grid */}
            <Grid container spacing={3}>
              {properties.map((property) => (
                <Grid item xs={12} sm={6} lg={4} key={property._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    {/* Favorite Button */}
                   {/* Favorite Button */}
                        <IconButton
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white', zIndex: 1 }}
                        onClick={() => toggleFavorite(property._id)}
                        >
                        {favorites.includes(property._id) ? (
                            <Favorite color="error" />  // ← Fixed: Favorite (filled)
                        ) : (
                            <FavoriteBorder />  // ← Fixed: FavoriteBorder (outlined)
                        )}
                        </IconButton>

                    {/* Property Image */}
                    <CardMedia
                      component="img"
                      height="200"
                      image={property.images?.[0] || 'https://via.placeholder.com/300x200'}
                      alt={property.location}
                      sx={{ objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => navigate(`/properties/${property._id}`)}
                    />

                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Location */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {property.location}
                        </Typography>
                      </Box>

                      {/* Price */}
                      <Typography variant="h6" color="primary" gutterBottom>
                        {formatPrice(property.price)}
                      </Typography>

                      {/* Category */}
                      <Chip 
                        label={property.category} 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />

                      {/* Description */}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {property.description.substring(0, 60)}...
                      </Typography>

                      {/* Features */}
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        {property.bedrooms && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BedIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2">{property.bedrooms}</Typography>
                          </Box>
                        )}
                        {property.bathrooms && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BathIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2">{property.bathrooms}</Typography>
                          </Box>
                        )}
                        {property.area && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AreaIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2">{property.area}m²</Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Agent Info */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Agent: {property.agent?.name || 'N/A'}
                        </Typography>
                        {property.agent?.rating && (
                          <Rating value={property.agent.rating} readOnly size="small" />
                        )}
                      </Box>
                    </CardContent>

                    {/* View Details Button */}
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => navigate(`/properties/${property._id}`)}
                        startIcon={<ViewIcon />}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Empty State */}
            {properties.length === 0 && !loading && (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No properties found
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Try adjusting your filters or search criteria
                </Typography>
                <Button variant="contained" onClick={handleReset}>
                  Clear Filters
                </Button>
              </Paper>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default BrowseProperties;