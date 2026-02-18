import React, { useState } from 'react';
import { 
  Button, 
  Container, 
  Paper, 
  Typography, 
  Alert,
  Box,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import api from '../services/api/apiClient';

const TestAPI = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState(null);

  // Test if backend is running
  const checkBackend = async () => {
    setLoading(true);
    setError(null);
    try {
      // Direct fetch to root
      const response = await fetch('http://localhost:5006/');
      const data = await response.json();
      setBackendStatus({ status: 'online', data });
      setError(null);
    } catch (err) {
      setBackendStatus({ status: 'offline', error: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Test API root
  const testApiRoot = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/');
      setResult({ endpoint: '/api/', data: response.data });
    } catch (err) {
      setError(err.message || 'Failed to connect to API');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Test user registration
  const testUserRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/users/register', {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        phone: '+2348012345678'
      });
      setResult({ endpoint: '/users/register', data: response.data });
    } catch (err) {
      setError(err.message || 'Registration failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          🔌 Backend Connection Test
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            Testing connection to backend at: <strong>http://localhost:5006</strong>
          </Typography>
          
          <Button 
            variant="contained" 
            onClick={checkBackend}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Check Backend Status
          </Button>
          
          {backendStatus && (
            <Chip 
              label={backendStatus.status === 'online' ? 'Backend Online ✅' : 'Backend Offline ❌'}
              color={backendStatus.status === 'online' ? 'success' : 'error'}
              sx={{ ml: 2 }}
            />
          )}
        </Box>

        {backendStatus?.status === 'online' && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: '#e8f5e9' }}>
            <Typography variant="body2">
              ✅ Backend is running! Response:
            </Typography>
            <pre style={{ fontSize: '12px', margin: '8px 0' }}>
              {JSON.stringify(backendStatus.data, null, 2)}
            </pre>
          </Paper>
        )}

        {backendStatus?.status === 'offline' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            ❌ Backend is not running. Please start your backend server:
            <br />
            <code>cd ../backend && node index.js</code>
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          API Endpoint Tests:
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            onClick={testApiRoot}
            disabled={loading || backendStatus?.status !== 'online'}
          >
            Test /api/
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={testUserRegister}
            disabled={loading || backendStatus?.status !== 'online'}
          >
            Test User Register
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            <Typography variant="subtitle2">Error:</Typography>
            {error}
          </Alert>
        )}

        {result && (
          <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom color="success.main">
              ✅ Success - Endpoint: {result.endpoint}
            </Typography>
            <pre style={{ 
              overflow: 'auto', 
              maxHeight: '400px',
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              padding: '16px',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </Paper>
        )}
      </Paper>
    </Container>
  );
};

export default TestAPI;