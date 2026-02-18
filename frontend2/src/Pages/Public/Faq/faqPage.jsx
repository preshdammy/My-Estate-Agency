import React, { useState } from 'react';
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Box,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState(false);

  const faqCategories = [
    {
      title: 'General Questions',
      questions: [
        {
          q: 'What is RealEstate Pro?',
          a: 'RealEstate Pro is a digital platform that connects property seekers with verified real estate agents. We offer a wide range of properties for sale and rent, making it easy to find your dream home.',
        },
        {
          q: 'Is RealEstate Pro free to use?',
          a: 'Yes, browsing properties and creating a user account is completely free. We only charge fees for premium services and agent subscriptions.',
        },
        {
          q: 'How do I create an account?',
          a: 'Click on the "Register" button on the top right corner, fill in your details, and verify your email address. Once done, you can start browsing properties and booking inspections.',
        },
      ],
    },
    {
      title: 'For Buyers/Renters',
      questions: [
        {
          q: 'How do I book a property inspection?',
          a: 'Once you find a property you like, click on "Request Inspection" on the property details page. Choose your preferred date and time, and the agent will confirm your request.',
        },
        {
          q: 'Can I save properties I like?',
          a: 'Yes, you can save properties to your favorites list by clicking the heart icon on any property card. You can view your saved properties in your dashboard.',
        },
        {
          q: 'How do I know if an agent is verified?',
          a: 'Verified agents have a blue checkmark badge on their profile. All agents on our platform undergo a strict verification process.',
        },
      ],
    },
    {
      title: 'For Agents',
      questions: [
        {
          q: 'How do I become an agent on RealEstate Pro?',
          a: 'Click on "Register" and select "Agent" option. Upload your credentials and certificate for verification. Once approved by admin, you can start listing properties.',
        },
        {
          q: 'How much does it cost to list properties?',
          a: 'We offer various subscription plans for agents. Basic listing is free, while premium plans offer additional features like highlighted listings and analytics.',
        },
        {
          q: 'How do I manage inspection requests?',
          a: 'All inspection requests appear in your agent dashboard. You can approve, reschedule, or reject requests based on your availability.',
        },
      ],
    },
    {
      title: 'Payments & Transactions',
      questions: [
        {
          q: 'What payment methods are accepted?',
          a: 'We accept bank transfers, credit/debit cards, and popular mobile money options. All payments are processed securely.',
        },
        {
          q: 'Is it safe to make payments through the platform?',
          a: 'Yes, all payments are encrypted and processed through secure payment gateways. We never store your payment information.',
        },
        {
          q: 'What is your refund policy?',
          a: 'Refunds are handled on a case-by-case basis. Please contact our support team for any payment-related issues.',
        },
      ],
    },
  ];

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.a.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 600 }}>
          Frequently Asked Questions
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Find answers to common questions about our platform
        </Typography>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* FAQ Categories */}
      {filteredFAQs.map((category, index) => (
        <Box key={index} sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            {category.title}
          </Typography>
          {category.questions.map((faq, idx) => (
            <Accordion
              key={idx}
              expanded={expanded === `${index}-${idx}`}
              onChange={handleChange(`${index}-${idx}`)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {faq.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" color="text.secondary">
                  {faq.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ))}

      {/* No Results */}
      {filteredFAQs.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No FAQs found matching "{searchTerm}"
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try searching with different keywords
          </Typography>
        </Box>
      )}

      {/* Still Have Questions */}
      <Paper sx={{ p: 4, mt: 6, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h5" gutterBottom>
          Still Have Questions?
        </Typography>
        <Typography variant="body1" paragraph sx={{ opacity: 0.9 }}>
          Can't find the answer you're looking for? Please contact our support team.
        </Typography>
        <Button
          component={Link}
          to="/contact"
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
          Contact Support
        </Button>
      </Paper>
    </Container>
  );
};

export default FAQPage;