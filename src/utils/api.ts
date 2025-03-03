import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_URL, ENDPOINTS, API_CONFIG } from '../constants/api';
import { useAuthStore } from '../store/authStore';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: API_CONFIG.REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;

        if (!refreshToken) {
          // No refresh token, force logout
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }

        // Try to refresh token
        const response = await axios.post(
          `${API_URL}${ENDPOINTS.REFRESH_TOKEN}`,
          { refresh: refreshToken }
        );

        const { access, refresh } = response.data;

        // Store the new tokens
        useAuthStore.getState().setTokens(access, refresh);

        // Retry the original request with new token
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${access}`,
        };

        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, force logout
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API helper functions
export const apiService = {
  /**
   * Make a GET request
   * @param url - The API endpoint
   * @param config - Optional axios config
   */
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.get(url, config);
    return response.data;
  },

  /**
   * Make a POST request
   * @param url - The API endpoint
   * @param data - The data to send
   * @param config - Optional axios config
   */
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.post(url, data, config);
    return response.data;
  },

  /**
   * Make a PUT request
   * @param url - The API endpoint
   * @param data - The data to send
   * @param config - Optional axios config
   */
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.put(url, data, config);
    return response.data;
  },

  /**
   * Make a PATCH request
   * @param url - The API endpoint
   * @param data - The data to send
   * @param config - Optional axios config
   */
  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.patch(url, data, config);
    return response.data;
  },

  /**
   * Make a DELETE request
   * @param url - The API endpoint
   * @param config - Optional axios config
   */
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.delete(url, config);
    return response.data;
  },
};

export default api;