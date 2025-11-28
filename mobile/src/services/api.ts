/**
 * API Client
 * Centralized axios instance with interceptors for auth and error handling
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiConfig } from '../config/api';
import { tokenStorage } from './storage';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await tokenStorage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token for request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      // Clear token and let the app handle re-authentication
      await tokenStorage.removeToken();

      // You could dispatch an event here to trigger logout in the app
      // For now, we'll just reject the promise and let the caller handle it
    }

    // Transform error for consistent handling
    const apiError: ApiError = {
      success: false,
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      errors: error.response?.data?.errors,
      status: error.response?.status,
    };

    return Promise.reject(apiError);
  }
);

/**
 * API helper functions
 */
export const api = {
  /**
   * GET request
   */
  async get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response = await apiClient.get<ApiResponse<T>>(url, { params });
    return response.data;
  },

  /**
   * POST request
   */
  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await apiClient.post<ApiResponse<T>>(url, data);
    return response.data;
  },

  /**
   * PUT request
   */
  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await apiClient.put<ApiResponse<T>>(url, data);
    return response.data;
  },

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    const response = await apiClient.patch<ApiResponse<T>>(url, data);
    return response.data;
  },

  /**
   * DELETE request
   */
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await apiClient.delete<ApiResponse<T>>(url);
    return response.data;
  },

  /**
   * POST request with FormData (for file uploads)
   */
  async postFormData<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
    const response = await apiClient.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * PUT request with FormData (for file uploads)
   */
  async putFormData<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
    const response = await apiClient.put<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

/**
 * Check if error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'success' in error &&
    (error as ApiError).success === false
  );
}

/**
 * Get error message from API error
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

/**
 * Get validation errors from API error
 */
export function getValidationErrors(error: unknown): Record<string, string[]> | undefined {
  if (isApiError(error)) {
    return error.errors;
  }
  return undefined;
}

/**
 * Get first validation error message for a field
 */
export function getFieldError(error: unknown, field: string): string | undefined {
  const errors = getValidationErrors(error);
  if (errors && errors[field] && errors[field].length > 0) {
    return errors[field][0];
  }
  return undefined;
}

// Export the raw axios instance for special cases
export { apiClient };

export default api;
