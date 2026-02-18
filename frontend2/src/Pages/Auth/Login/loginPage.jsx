import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../../Store/slices/authSlice';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  Divider,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Check for registration success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSnackbar({
        open: true,
        message: location.state.message,
        severity: 'success',
      });
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const result = await dispatch(login(formData)).unwrap();
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Login successful! Redirecting...',
        severity: 'success',
      });
      
      // Redirect based on role
      setTimeout(() => {
        switch (result.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'agent':
            navigate('/agent/dashboard');
            break;
          default:
            navigate('/user/dashboard');
        }
      }, 1500);
    } catch (err) {
      // Error is handled by Redux
      console.error('Login failed:', err);
    }
  };

  const handleDemoLogin = (role) => {
    const demos = {
      user: { email: 'john@example.com', password: 'password123' },
      agent: { email: 'jane@agent.com', password: 'agentpass123' },
      admin: { email: 'admin@realestate.com', password: 'Admin@123' },
    };
    
    setFormData({
      email: demos[role].email,
      password: demos[role].password,
      role: role,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 5 },
            width: '100%',
            borderRadius: 2,
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to continue to RealEstate Pro
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Role Selection */}
            <FormControl fullWidth error={!!errors.role} sx={{ mb: 3 }}>
              <InputLabel>Login as</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label="Login as"
                onChange={handleChange}
              >
                <MenuItem value="user">User (Renter/Buyer)</MenuItem>
                <MenuItem value="agent">Real Estate Agent</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
              </Select>
              {errors.role && (
                <Typography variant="caption" color="error">
                  {errors.role}
                </Typography>
              )}
            </FormControl>

            {/* Email Field */}
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Forgot Password Link */}
            <Box sx={{ textAlign: 'right', mb: 2 }}>
              <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Forgot Password?
                </Typography>
              </Link>
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          {/* Demo Login Buttons */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
              Demo Accounts (Quick Login)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleDemoLogin('user')}
                sx={{ textTransform: 'none' }}
                disabled={loading}
              >
                👤 User
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleDemoLogin('agent')}
                sx={{ textTransform: 'none' }}
                disabled={loading}
              >
                🏢 Agent
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleDemoLogin('admin')}
                sx={{ textTransform: 'none' }}
                disabled={loading}
              >
                ⚙️ Admin
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              New to RealEstate Pro?
            </Typography>
          </Divider>

          {/* Register Links */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              component={Link}
              to="/register/user"
              variant="contained"
              color="secondary"
              fullWidth
              sx={{
                mb: 1,
                py: 1.2,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Create User Account
            </Button>
            <Button
              component={Link}
              to="/register/agent"
              variant="outlined"
              fullWidth
              sx={{
                py: 1.2,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Register as Agent
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LoginPage;