// import { Platform } from "react-native";

// // API configuration
// export const API_CONFIG = {
//   // Base URLs
//   DEV_API_URL: 'http://10.0.2.2:8000', // For Android emulator
//   PROD_API_URL: 'https://api.okada-app.com', // Production URL

//   // WebSocket URLs
//   DEV_WS_URL: 'ws://10.0.2.2:8000/ws/',
//   PROD_WS_URL: 'wss://api.okada-app.com/ws/',

//   // Timeouts
//   REQUEST_TIMEOUT: 15000, // 15 seconds

//   // WebSocket configuration
//   WS_CONFIG: {
//     RECONNECT_ATTEMPTS: 10,
//     RECONNECT_DELAY_MS: 3000,
//     HEARTBEAT_INTERVAL_MS: 30000,
//     CONNECTION_TIMEOUT_MS: 10000,
//   },
// };

// // Determine if we're in production
// const isProduction = process.env.NODE_ENV === 'production';

// // Export base URLs based on environment
// export const API_URL = isProduction ? API_CONFIG.PROD_API_URL : API_CONFIG.DEV_API_URL;
// export const WS_BASE_URL = isProduction ? API_CONFIG.PROD_WS_URL : API_CONFIG.DEV_WS_URL;

// // Define effective WebSocket URL
// const effectiveWsUrl = WS_BASE_URL;

// // API endpoints
// export const ENDPOINTS = {
//   // Auth endpoints
//   LOGIN: '/api/auth/login/',
//   REGISTER: '/api/auth/register/',
//   REFRESH_TOKEN: '/api/auth/token/refresh/',

//   // User endpoints
//   USER_PROFILE: '/api/users/profile/',

//   // Rider endpoints
//   REQUEST_RIDE: '/api/rides/request/',
//   RIDE_HISTORY: '/api/rides/history/',
//   RIDE_DETAILS: (rideId: string) => `/api/rides/${rideId}/`,

//   // Driver endpoints
//   DRIVER_PROFILE: '/api/drivers/profile/',
//   DRIVER_STATUS: '/api/drivers/status/',
//   DRIVER_EARNINGS: '/api/drivers/earnings/',

//   // WebSocket endpoints
//   RIDES_SOCKET: `${effectiveWsUrl}rides/`,
// };

// src/constants/api.ts
// These need to be updated with your actual values

// Use your computer's actual IP address when developing with Expo
// NOT localhost or 127.0.0.1 which would point to the device itself
export const API_URL = 'http://192.168.1.224:8081';  // Replace with your actual IP

export const WS_BASE_URL = 'ws://192.168.1.224:8081';

export const ENDPOINTS = {
  LOGIN: '/api/auth/login/',
  REGISTER: '/api/auth/register/',
  REFRESH_TOKEN: '/api/auth/token/refresh/',
  LOGOUT: '/api/auth/logout/',
  USER_PROFILE: '/api/accounts/profile/',
  RIDES_SOCKET: `${WS_BASE_URL}/ws/rides/`, // Replace with your actual IP
};

export const API_CONFIG = {
  REQUEST_TIMEOUT: 15000, // 15 seconds
  WS_CONFIG: {
    CONNECTION_TIMEOUT_MS: 10000, // 10 seconds
    HEARTBEAT_INTERVAL_MS: 30000, // 30 seconds
    RECONNECT_DELAY_MS: 2000, // Initial reconnect delay
    RECONNECT_ATTEMPTS: 5, // Max reconnect attempts
  }
};