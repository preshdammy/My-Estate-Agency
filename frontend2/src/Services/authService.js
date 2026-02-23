import api from './api/apiClient';

const authService = {
  // User Login
  login: async (email, password, role) => {
    let endpoint = '';
    
    switch (role) {
      case 'admin':
        endpoint = '/admin/login';
        break;
      case 'agent':
        endpoint = '/agents/login';
        break;
      default:
        endpoint = '/users/login';
    }
    
    const response = await api.post(endpoint, { email, password });
    return response.data;
  },

  // User Registration
  registerUser: async (userData) => {
    const response = await api.post('/users/register', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
    });
    return response.data;
  },

  // Agent Registration with file upload
  registerAgent: async (formData) => {
    try {
      const response = await api.post('/agents/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      console.error('Agent registration error:', error);
      throw error;
    }
  },

  // Get Profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Test file upload
  testUpload: async (file, name) => {
    const formData = new FormData();
    formData.append('testFile', file);
    formData.append('name', name);
    
    const response = await api.post('/agents/test-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  }
};

export default authService;