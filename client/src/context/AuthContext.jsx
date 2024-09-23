import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const fetchUserDetails = async () => {
    try {
      const response = await axiosInstance.get('/api/user/profile');
      return response.data.user;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  const login = async (token) => {
    console.log("Token received in login:", token);

    if (typeof token !== 'string') {
      console.error('Invalid token format');
      return;
    }

    try {
      localStorage.setItem('token', token);
      const userDetails = await fetchUserDetails();
      if (userDetails) {
        setUser(userDetails);
        localStorage.setItem('user', JSON.stringify(userDetails));
      } else {
        console.error('Failed to fetch user details');
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Login failed', error);
      localStorage.removeItem('token');
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/api/user/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
