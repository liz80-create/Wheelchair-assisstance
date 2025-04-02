// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import { jwtDecode } from 'jwt-decode'; // Install: npm install jwt-decode

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Holds decoded user info (id, username, etc.)
  const [profile, setProfile] = useState(null); // Holds detailed profile (type, needs)
  const [isLoading, setIsLoading] = useState(true); // Check auth status on initial load
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken'); // Needed for refresh logic

      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp > currentTime) {
            // Token is valid
            setAccessToken(token);
            setUser({ id: decoded.user_id, username: decoded.username /* add other fields if in token */ });
            await fetchUserProfile(token); // Fetch profile after setting user
          } else {
            // Token expired - try to refresh (implement refresh logic if needed)
            console.warn("Access token expired. Implement refresh logic.");
            logout(); // Simple logout if refresh not implemented
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          logout(); // Clear invalid token/state
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []); // Run only once on mount

  const fetchUserProfile = async (token) => {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await apiClient.get('/profile/', config);
      setProfile(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Handle error appropriately - maybe logout if profile is essential?
      setProfile(null); // Clear profile on error
      return null;
    }
  };

  const login = async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login/', { username, password });
      const { access, refresh } = response.data;

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh); // Store refresh token

      const decoded = jwtDecode(access);
      setAccessToken(access);
      setUser({ id: decoded.user_id, username: decoded.username });
      await fetchUserProfile(access); // Fetch profile immediately after login
      return true; // Indicate success
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      logout(); // Clear any potential partial state
      return false; // Indicate failure
    }
  };

  const register = async (userData) => {
    try {
      // Assuming userData includes: username, password, password2, email, first_name, last_name, user_type
      await apiClient.post('/auth/register/', userData);
      // Optionally log the user in directly after registration
      // await login(userData.username, userData.password);
      return true;
    } catch (error) {
       console.error("Registration failed:", error.response?.data || error.message);
       // Provide specific error messages based on response if possible
       throw error; // Re-throw to be caught in the component for UI feedback
    }
  };


  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setUser(null);
    setProfile(null);
    // Optionally redirect using useNavigate in components after calling logout
  };

  // Function to update profile (needs)
  const updateUserProfile = async (needsData) => {
      if (!accessToken) return null;
      try {
          // needsData should be like: { needs_ids: [1, 3, 5] }
          const response = await apiClient.patch('/profile/', needsData); // Use PATCH for partial update
          setProfile(response.data); // Update local profile state
          return response.data;
      } catch (error) {
          console.error("Failed to update profile:", error.response?.data || error.message);
          throw error; // Re-throw for handling in component
      }
  };

  const value = {
    user, // Basic user info from token
    profile, // Detailed profile info from /profile/ endpoint
    accessToken,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    fetchUserProfile, // Expose if needed elsewhere
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};