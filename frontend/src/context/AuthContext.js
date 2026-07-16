import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';
import { registerUnauthorizedHandler } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session from AsyncStorage on startup
  const restoreSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('media_lock_token');
      const storedUser = await AsyncStorage.getItem('media_lock_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.warn('Error restoring session from AsyncStorage:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Perform login network request and persist details
  const login = async (email, password) => {
    const response = await authService.login(email, password);
    // Backend formats response as: { status: 'success', token, data: { id, name, email, wallet_balance } }
    const jwtToken = response.token;
    const userData = response.data;

    await AsyncStorage.setItem('media_lock_token', jwtToken);
    await AsyncStorage.setItem('media_lock_user', JSON.stringify(userData));

    setToken(jwtToken);
    setUser(userData);
    return response;
  };

  // Perform user registration
  const register = async (name, email, password) => {
    return await authService.register(name, email, password);
  };

  // Clear session state and AsyncStorage keys
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('media_lock_token');
      await AsyncStorage.removeItem('media_lock_user');
    } catch (err) {
      console.warn('Error clearing storage on logout:', err);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  // Bind the unauthorized response interceptor on mount
  useEffect(() => {
    registerUnauthorizedHandler(async () => {
      await logout();
    });
    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        restoreSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};

export default AuthContext;
