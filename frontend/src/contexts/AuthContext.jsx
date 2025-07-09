'use client'; // This directive is essential for Context API in Next.js App Router

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import apiClient from '../lib/apiClient';
import { jwtDecode } from 'jwt-decode'; // Using jwt-decode to get user info from token

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // For initial auth state check
  const [error, setError] = useState(null); // For login/register errors

  const loadUserFromToken = useCallback(async (token) => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // You might want to fetch full user profile here if token only has ID
        // For now, using decoded token content. Ensure your JWT contains necessary user info.
        // e.g. if your backend's JWT payload is { userId, phoneNumber, ... }
        // Check token expiration
        if (decodedToken.exp * 1000 < Date.now()) {
            console.log("Token expired, logging out.");
            logout(); // Token is expired
            return;
        }
        // apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Set for future requests
        // Fetch user profile if needed, or use token data
        // const profileResponse = await apiClient.get('/users/profile');
        // setUser(profileResponse.data);

        // For simplicity now, if token has basic info like userId, role:
         setUser({
            id: decodedToken.userId, // Adjust based on your JWT payload
            phoneNumber: decodedToken.phoneNumber, // Adjust based on your JWT payload
            // Add other relevant fields from token or fetched profile
        });

      } catch (e) {
        console.error('Failed to decode token or fetch user:', e);
        Cookies.remove('authToken'); // Invalid token
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const token = Cookies.get('authToken');
    if (token) {
      loadUserFromToken(token);
    } else {
      setLoading(false);
    }
  }, [loadUserFromToken]);

  const login = async (phoneNumber, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { phone_number: phoneNumber, password });
      const { token, user: loggedInUser } = response.data; // Assuming backend returns token and user object
      Cookies.set('authToken', token, { expires: 1, secure: process.env.NODE_ENV === 'production' }); // Expires in 1 day
      // apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // setUser(loggedInUser); // Or decode token if user object not returned fully
      await loadUserFromToken(token); // Reload user from new token
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Login failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  const requestOtpForRegister = async (phoneNumber) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/register/request-otp', { phone_number: phoneNumber });
      setLoading(false);
      // OTP is returned for testing in backend, but not used directly here
      return { success: true, message: response.data.message, otpForTesting: response.data.otp };
    } catch (err) {
      console.error('Request OTP failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to request OTP.');
      setLoading(false);
      return { success: false, message: err.response?.data?.message || 'Failed to request OTP.' };
    }
  };

  const verifyOtpAndRegister = async (phoneNumber, otp, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/register/verify-otp', { phone_number: phoneNumber, otp, password });
      // Assuming registration does not automatically log in the user.
      // Or if it does, handle token and user state similar to login().
      setLoading(false);
      return { success: true, message: response.data.message };
    } catch (err) {
      console.error('Registration failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Registration failed.');
      setLoading(false);
      return { success: false, message: err.response?.data?.message || 'Registration failed.' };
    }
  };


  const logout = () => {
    Cookies.remove('authToken');
    // delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
    // Optionally redirect to login page
    // window.location.href = '/login'; // Be careful with this in Next.js
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
    requestOtpForRegister,
    verifyOtpAndRegister,
    requestPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPassword,
    clearError: () => setError(null)
  };

  // --- Password Reset Functions ---
  async function requestPasswordResetOtp(phoneNumber) {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/forgot-password/request-otp', { phone_number: phoneNumber });
      setLoading(false);
      return { success: true, message: response.data.message, otpForTesting: response.data.otp }; // OTP for testing
    } catch (err) {
      console.error('Request Password Reset OTP failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to request OTP for password reset.');
      setLoading(false);
      return { success: false, message: err.response?.data?.message || 'Failed to request OTP.' };
    }
  }

  async function verifyPasswordResetOtp(phoneNumber, otp) {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/forgot-password/verify-otp', { phone_number: phoneNumber, otp });
      setLoading(false);
      return { success: true, message: response.data.message };
    } catch (err) {
      console.error('Verify Password Reset OTP failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'OTP verification failed.');
      setLoading(false);
      return { success: false, message: err.response?.data?.message || 'OTP verification failed.' };
    }
  }

  async function resetPassword(phoneNumber, otp, newPassword) {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/forgot-password/reset', { phone_number: phoneNumber, otp, new_password: newPassword });
      setLoading(false);
      return { success: true, message: response.data.message };
    } catch (err) {
      console.error('Reset Password failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Password reset failed.');
      setLoading(false);
      return { success: false, message: err.response?.data?.message || 'Password reset failed.' };
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) { // Check for null as initial value is null
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
