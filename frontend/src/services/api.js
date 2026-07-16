import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../constants/api';

// Create Axios HTTP client instance
const api = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Registry for context logout triggers on unauthorized responses
let onUnauthorizedCallback = null;

export const registerUnauthorizedHandler = (callback) => {
  onUnauthorizedCallback = callback;
};

// 1. Request Interceptor: Automatically inject JWT Bearer token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('media_lock_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('Failed to retrieve token from AsyncStorage:', err);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Intercept 401 errors to trigger session clearing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      console.log('Intercepted 401 Unauthorized API response. Clearing session...');
      if (onUnauthorizedCallback) {
        await onUnauthorizedCallback();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
