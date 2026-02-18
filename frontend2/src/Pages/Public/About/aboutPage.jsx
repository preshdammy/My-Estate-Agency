import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Avatar,
  Box,
  Divider,
} from '@mui/material';
import {
  Visibility as VisionIcon,
  TrackChanges as MissionIcon,
  EmojiEvents as ValuesIcon,
} from '@mui/icons-material';

const AboutPage = () => {
  const team = [
    {
      name: 'John Adebayo',
      role: 'CEO & Founder',
      bio: '15+ years in real estate industry. Passionate about helping people find their dream homes.',
      avatar: 'https://i.pravatar.cc/150?img=7',
    },
    {
      name: 'Sarah Okonkwo',
      role: 'Head of Operations',
      bio: 'Expert in property management and customer relations.',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    {
      name: 'Michael Okafor',
      role: 'Lead Agent',
      bio: 'Top-performing agent with 200+ successful deals.',
      avatar: 'https://i.pravatar.cc/150?img=8',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 600 }}>
          About RealEstate Pro
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Your trusted partner in finding the perfect property
        </Typography>
      </Box>

      {/* Story Section */}
      <Grid container spacing={6} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Our Story
          </Typography>
          <Typography variant="body1" paragraph>
            Founded in 2020, RealEstate Pro has grown to become one of the most trusted real estate platforms in Nigeria. We started with a simple mission: to make property hunting easy, transparent, and enjoyable for everyone.
          </Typography>
          <Typography variant="body1" paragraph>
            Today, we have helped thousands of families find their dream homes and assisted numerous investors in making profitable property investments. Our platform connects buyers, renters, and sellers in a seamless digital experience.
          </Typography>
          <Typography variant="body1">
            We pride ourselves on our verified agents, extensive property listings, and customer-first approach. Every property on our platform is carefully vetted to ensure quality and authenticity.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"
            alt="Our Office"
            sx={{
              width: '100%',
              height: 'auto',
              borderRadius: 4,
              boxShadow: 4,
            }}
          />
        </Grid>
      </Grid>

      {/* Vision & Mission */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 70, height: 70, mx: 'auto', mb: 2 }}>
              <VisionIcon sx={{ fontSize: 35 }} />
            </Avatar>
            <Typography variant="h5" gutterBottom>
              Our Vision
            </Typography>
            <Typography color="text.secondary">
              To become Africa's leading digital real estate platform, making property transactions accessible to everyone.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 70, height: 70, mx: 'auto', mb: 2 }}>
              <MissionIcon sx={{ fontSize: 35 }} />
            </Avatar>
            <Typography variant="h5" gutterBottom>
              Our Mission
            </Typography>
            <Typography color="text.secondary">
              To simplify property search and transactions through innovative technology and exceptional customer service.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 70, height: 70, mx: 'auto', mb: 2 }}>
              <ValuesIcon sx={{ fontSize: 35 }} />
            </Avatar>
            <Typography variant="h5" gutterBottom>
              Our Values
            </Typography>
            <Typography color="text.secondary">
              Integrity, Transparency, Innovation, and Customer-Centricity guide everything we do.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Team Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
          Meet Our Team
        </Typography>
        <Grid container spacing={4}>
          {team.map((member) => (
            <Grid item xs={12} md={4} key={member.name}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Avatar
                  src={member.avatar}
                  sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  {member.name}
                </Typography>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  {member.role}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  {member.bio}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default AboutPage;