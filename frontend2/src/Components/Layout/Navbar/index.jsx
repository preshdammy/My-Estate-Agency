import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={{ 
      backgroundColor: '#1976d2', 
      padding: '20px',
      display: 'flex',
      justifyContent: 'center',
      gap: '20px'
    }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>
        Home
      </Link>
      <Link to="/properties" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>
        Properties
      </Link>
      <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>
        Login
      </Link>
      <Link to="/register" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>
        Register
      </Link>
    </nav>
  );
};

export default Navbar;