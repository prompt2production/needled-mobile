/**
 * Axios API Client
 * Configured with auth interceptor and error handling
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Storage key for auth token
export const AUTH_TOKEN_KEY = 'needled_auth_token';

// Base URL - update for production
// For local development on physical device, use your machine's IP address
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://needled.tunnel.spacerockapps.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // SecureStore may fail on web or in certain environments
      console.warn('Failed to get auth token from secure store:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors
let onUnauthorized: (() => void) | null = null;

export const setOnUnauthorized = (callback: () => void) => {
  onUnauthorized = callback;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token on 401
      try {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      } catch (e) {
        console.warn('Failed to clear auth token:', e);
      }
      // Trigger logout callback if set
      if (onUnauthorized) {
        onUnauthorized();
      }
    }
    return Promise.reject(normalizeError(error));
  }
);

// Error normalization
export interface ApiErrorResponse {
  message: string;
  code?: string;
  field?: string;
  errors?: Array<{
    code: string;
    message: string;
    path: string[];
  }>;
}

function normalizeError(error: AxiosError): ApiErrorResponse {
  if (error.response?.data) {
    const data = error.response.data as { error?: string | Array<{ code: string; message: string; path: string[] }> };

    if (typeof data.error === 'string') {
      return { message: data.error };
    }

    if (Array.isArray(data.error)) {
      // Validation errors - return first error message
      const firstError = data.error[0];
      return {
        message: firstError?.message || 'Validation error',
        field: firstError?.path?.join('.'),
        errors: data.error,
      };
    }
  }

  // Network or timeout errors
  if (error.code === 'ECONNABORTED') {
    return { message: 'Request timed out. Please try again.' };
  }

  if (!error.response) {
    return { message: 'Unable to connect to server. Please check your connection.' };
  }

  return { message: 'An unexpected error occurred. Please try again.' };
}

// Token management utilities
export const saveToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const clearToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  } catch (e) {
    console.warn('Failed to clear auth token:', e);
  }
};

export default api;
