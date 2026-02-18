import api from './api/apiClient';

export const authService = {
  // User Login
  login: async (email, password, role) => {
    let endpoint = '';
    
    // Determine endpoint based on role
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

  // Agent Registration (with file upload)
  registerAgent: async (agentData) => {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('name', agentData.get('name'));
    formData.append('email', agentData.get('email'));
    formData.append('password', agentData.get('password'));
    formData.append('phone', agentData.get('phone'));
    formData.append('certificate', agentData.get('certificate'));

    const response = await api.post('/agents/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get Current User Profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  },
};

export default authService;