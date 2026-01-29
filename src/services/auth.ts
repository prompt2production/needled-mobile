/**
 * Auth API Service
 */

import api, { saveToken } from './api';
import { User, LoginRequest, RegisterRequest } from '../types/api';

// Login response includes token for native apps
interface LoginResponse extends User {
  token: string;
}

/**
 * Login user
 */
export const login = async (
  email: string,
  password: string
): Promise<{ user: User; token: string }> => {
  const response = await api.post<LoginResponse>('/auth/login', {
    email,
    password,
  } as LoginRequest);

  const { token, ...user } = response.data;
  return { user, token };
};

/**
 * Register new user then auto-login to get token
 */
export const register = async (
  data: RegisterRequest
): Promise<{ user: User; token: string }> => {
  // First, create the account
  await api.post<User>('/users', data);

  // Then login to get the token
  const loginResponse = await api.post<LoginResponse>('/auth/login', {
    email: data.email,
    password: data.password,
  });

  const { token, ...user } = loginResponse.data;
  return { user, token };
};

/**
 * Get current session user
 */
export const getSession = async (): Promise<User> => {
  const response = await api.get<User>('/auth/session');
  return response.data;
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};
