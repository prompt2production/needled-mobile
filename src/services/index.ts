/**
 * API Services
 * Centralized exports for all API services
 */

// Core API client
export { default as api, AUTH_TOKEN_KEY, saveToken, getToken, clearToken } from './api';
export type { ApiErrorResponse } from './api';

// Auth services
export * as authService from './auth';

// Feature services
export * as dashboardService from './dashboard';
export * as habitsService from './habits';
export * as injectionsService from './injections';
export * as weighinsService from './weighins';
export * as calendarService from './calendar';
export * as settingsService from './settings';
