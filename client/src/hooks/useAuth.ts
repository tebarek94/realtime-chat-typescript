import { useState, useEffect, useCallback } from 'react';
import { User, LoginRequest, RegisterRequest, AuthState } from '../types';
import { apiService } from '../services/api';
import { socketService } from '../services/socket';

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token && apiService.isTokenValid()) {
        try {
          apiService.setToken(token);
          const user = await apiService.getProfile();
          
          setState({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          // Connect to socket
          socketService.connect(token);
        } catch (error) {
          console.error('Auth initialization failed:', error);
          apiService.clearToken();
          setState({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: 'Session expired. Please log in again.',
          });
        }
      } else {
        // Clear invalid token
        if (token) {
          apiService.clearToken();
        }
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiService.login(credentials);
      
      setState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      // Connect to socket
      socketService.connect(response.token);
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiService.register(userData);
      
      setState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      // Connect to socket
      socketService.connect(response.token);
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Disconnect socket
      socketService.disconnect();
      
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    }
  }, []);

  const updateProfile = useCallback(async (userData: Partial<User>) => {
    if (!state.user) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const updatedUser = await apiService.updateProfile(userData);
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        loading: false,
        error: null,
      }));
      
      return updatedUser;
    } catch (error: any) {
      const errorMessage = error.message || 'Profile update failed';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [state.user]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };
};
