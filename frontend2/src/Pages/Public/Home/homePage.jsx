import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Paper,
  Avatar,
  Rating,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search,
  Home,
  Security,
  Speed,
  ArrowForward,
  LocationOn,
  Star,
} from '@mui/icons-material';

const HomePage = () => {
  // Featured properties (mock data)
  const featuredProperties = [
    {
      id: 1,
      title: 'Luxury Apartment in Lekki',
      location: 'Lekki Phase 1, Lagos',
      price: '₦5,000,000',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500',
      beds: 3,
      baths: 4,
    },
    {
      id: 2,
      title: 'Modern Duplex in VI',
      location: 'Victoria Island, Lagos',
      price: '₦7,500,000',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500',
      beds: 4,
      baths: 5,
    },
    {
      id: 3,
      title: 'Cozy Studio Apartment',
      location: 'Ikeja, Lagos',
      price: '₦2,500,000',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
      beds: 1,
      baths: 1,
    },
  ];

  // Testimonials (mock data)
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Home Buyer',
      comment: 'Found my dream home within a week! The platform is easy to use and the agents are very responsive.',
      rating: 5,
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    {
      id: 2,
      name: 'Michael Obi',
      role: 'Property Investor',
      comment: 'Great selection of properties. The inspection booking system saved me so much time.',
      rating: 5,
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
    {
      id: 3,
      name: 'Amara Nwosu',
      role: 'First-time Buyer',
      comment: 'The agents were very helpful and guided me through the entire process. Highly recommended!',
      rating: 4,
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                }}
              >
                Find Your Dream Home Today
              </Typography>
              <Typography variant="h5" paragraph sx={{ mb: 4, opacity: 0.9 }}>
                Discover thousands of properties from trusted agents. Whether you're buying, renting, or investing, we've got you covered.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component={Link}
                  to="/properties"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                >
                  Browse Properties
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Get Started
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
                alt="Modern Home"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 4,
                  boxShadow: 10,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Search Section */}
      <Container maxWidth="lg" sx={{ mt: -5, position: 'relative', zIndex: 10 }}>
        <Paper elevation={6} sx={{ p: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Search Properties
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Location"
                placeholder="Enter city or area"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Property Type</InputLabel>
                <Select label="Property Type" defaultValue="">
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="apartment">Apartment</MenuItem>
                  <MenuItem value="house">House</MenuItem>
                  <MenuItem value="duplex">Duplex</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Price Range</InputLabel>
                <Select label="Price Range" defaultValue="">
                  <MenuItem value="">Any Price</MenuItem>
                  <MenuItem value="0-1000000">₦0 - ₦1M</MenuItem>
                  <MenuItem value="1000000-5000000">₦1M - ₦5M</MenuItem>
                  <MenuItem value="5000000-10000000">₦5M - ₦10M</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                variant="contained"
                fullWidth
                component={Link}
                to="/properties"
                startIcon={<Search />}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontWeight: 600, mb: 6 }}
        >
          Why Choose Us
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                <Search sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography variant="h5" gutterBottom>
                Wide Selection
              </Typography>
              <Typography color="text.secondary">
                Thousands of properties across all categories and price ranges to choose from.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                <Security sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography variant="h5" gutterBottom>
                Trusted Agents
              </Typography>
              <Typography color="text.secondary">
                All agents are verified and approved to ensure a safe and secure experience.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                <Speed sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography variant="h5" gutterBottom>
                Easy Process
              </Typography>
              <Typography color="text.secondary">
                Book inspections, make payments, and move in with just a few clicks.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Featured Properties */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ fontWeight: 600, mb: 6 }}
          >
            Featured Properties
          </Typography>
          <Grid container spacing={4}>
            {featuredProperties.map((property) => (
              <Grid item xs={12} md={4} key={property.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="240"
                    image={property.image}
                    alt={property.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {property.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {property.location}
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {property.price}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Typography variant="body2">🛏️ {property.beds} beds</Typography>
                      <Typography variant="body2">🚿 {property.baths} baths</Typography>
                    </Box>
                  </CardContent>
                  <Box sx={{ p: 2 }}>
                    <Button
                      component={Link}
                      to={`/properties/${property.id}`}
                      variant="outlined"
                      fullWidth
                      endIcon={<ArrowForward />}
                    >
                      View Details
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              component={Link}
              to="/properties"
              variant="contained"
              size="large"
            >
              View All Properties
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Testimonials */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontWeight: 600, mb: 6 }}
        >
          What Our Clients Say
        </Typography>
        <Grid container spacing={4}>
          {testimonials.map((testimonial) => (
            <Grid item xs={12} md={4} key={testimonial.id}>
              <Paper sx={{ p: 4, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={testimonial.avatar}
                    sx={{ width: 60, height: 60, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6">{testimonial.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {testimonial.role}
                    </Typography>
                  </Box>
                </Box>
                <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  "{testimonial.comment}"
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
            Ready to Find Your Dream Home?
          </Typography>
          <Typography variant="h6" paragraph sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of satisfied customers who found their perfect property through us.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              Get Started
            </Button>
            <Button
              component={Link}
              to="/contact"
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Contact Us
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;