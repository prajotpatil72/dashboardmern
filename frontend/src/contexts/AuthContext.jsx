/**
 * Authentication Context (Tasks 101-110)
 * Manages guest authentication state and operations
 */
import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Task 102: Define AuthContext with createContext()
const AuthContext = createContext(null);

// API Base URL - Make sure this matches your backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/v1`;

// Debug: Log API URL on load
console.log('Auth API URL:', API_URL);

/**
 * Task 103: AuthProvider component managing auth state
 */
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  
  // Task 104: Setup state
  const [state, setState] = useState({
    user: null,
    token: null,
    loading: true,
    error: null,
    isGuest: true,
    quotaRemaining: 100,
  });

  /**
   * Update state helper
   */
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Task 105: loginAsGuest() - calls /api/v1/auth/guest endpoint
   */
  const loginAsGuest = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });

      const response = await axios.post(`${API_URL}/auth/guest`, {}, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Backend returns { success, data: { token, user } }
      const { data } = response.data;
      const { token, user } = data;

      // Store token in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('token_expiry', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());

      // Update state
      updateState({
        user,
        token,
        isGuest: true,
        quotaRemaining: user.quotaRemaining || 100,
        loading: false,
        error: null,
      });

      navigate('/search');

      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to authenticate as guest';
      
      updateState({
        loading: false,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  }, [navigate, updateState]);

  /**
   * Task 106: logout() - clears token, redirects to home
   */
  const logout = useCallback(async () => {
    try {
      // Optional: Call backend logout endpoint to blacklist token
      if (state.token) {
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: {
            'Authorization': `Bearer ${state.token}`,
          },
        }).catch(() => {
          // Ignore errors on logout
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token_expiry');

      // Reset state
      setState({
        user: null,
        token: null,
        loading: false,
        error: null,
        isGuest: true,
        quotaRemaining: 100,
      });

      // Redirect to home
      navigate('/');
    }
  }, [state.token, navigate]);

  /**
   * Task 107: checkAuthStatus() - verifies token on mount
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const expiry = localStorage.getItem('token_expiry');

      // No token found
      if (!token) {
        updateState({ loading: false });
        return;
      }

      // Check if token is expired
      if (expiry && new Date(expiry) < new Date()) {
        console.log('Token expired, clearing...');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token_expiry');
        updateState({ loading: false });
        return;
      }

      // Verify token with backend
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const { user, quotaRemaining } = response.data;

      // Token is valid, restore session
      updateState({
        user,
        token,
        isGuest: true,
        quotaRemaining,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Auth verification failed:', error);
      
      // Clear invalid token
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token_expiry');
      
      updateState({
        user: null,
        token: null,
        loading: false,
        error: null,
      });
    }
  }, [updateState]);

  /**
   * Task 108: refreshGuestSession() - extends session by 24h
   */
  const refreshGuestSession = useCallback(async () => {
    try {
      if (!state.token) {
        throw new Error('No active session to refresh');
      }

      updateState({ loading: true, error: null });

      const response = await axios.post(`${API_URL}/auth/guest/refresh`, {}, {
        headers: {
          'Authorization': `Bearer ${state.token}`,
        },
      });

      // Backend returns { success, data: { token, user } }
      const { data } = response.data;
      const { token: newToken, user } = data;

      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('token_expiry', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());

      updateState({
        user,
        token: newToken,
        quotaRemaining: user.quotaRemaining || 100,
        loading: false,
        error: null,
      });

      return { success: true, message: 'Session refreshed successfully' };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to refresh session';
      
      updateState({
        loading: false,
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  }, [state.token, updateState]);

  /**
   * Update quota remaining (called after API calls)
   */
  const updateQuota = useCallback((newQuotaRemaining) => {
    updateState({ quotaRemaining: newQuotaRemaining });
  }, [updateState]);

  /**
   * Get session time remaining
   */
  const getSessionTimeRemaining = useCallback(() => {
    const expiry = localStorage.getItem('token_expiry');
    if (!expiry) return 0;

    const expiryDate = new Date(expiry);
    const now = new Date();
    const timeRemaining = expiryDate - now;

    return Math.max(0, timeRemaining);
  }, []);

  /**
   * Task 107: Check auth status on mount
   */
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  /**
   * Auto-refresh session when it's about to expire (1 hour before)
   */
  useEffect(() => {
    if (!state.token) return;

    const interval = setInterval(() => {
      const timeRemaining = getSessionTimeRemaining();
      const oneHour = 60 * 60 * 1000;

      // Refresh if less than 1 hour remaining
      if (timeRemaining > 0 && timeRemaining < oneHour) {
        console.log('Auto-refreshing session...');
        refreshGuestSession();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [state.token, getSessionTimeRemaining, refreshGuestSession]);

  // Task 109: Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    // State
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    isGuest: state.isGuest,
    quotaRemaining: state.quotaRemaining,
    isAuthenticated: !!state.token,
    
    // Actions
    loginAsGuest,
    logout,
    refreshGuestSession,
    updateQuota,
    getSessionTimeRemaining,
    checkAuthStatus,
  }), [
    state,
    loginAsGuest,
    logout,
    refreshGuestSession,
    updateQuota,
    getSessionTimeRemaining,
    checkAuthStatus,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Task 109: Custom hook useAuth() - returns context with memoization
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;