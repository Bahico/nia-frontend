import { API_BASE_URL } from '@/constants/api-url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosRequestConfig, Method } from 'axios';

const AUTH_TOKEN_KEY = '@auth_token';

export interface ApiOptions extends Omit<AxiosRequestConfig, 'url'> {
  requireAuth?: boolean;
}

function buildUrl(endpoint: string): string {
  return endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

async function getAuthHeaders(requireAuth: boolean): Promise<Record<string, string>> {
  if (!requireAuth) return {};
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    if (requireAuth) {
      throw new Error('No authentication token found');
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
    if (requireAuth) {
      throw new Error('Authentication required');
    }
  }
  return {};
}

/**
 * Make an authenticated API request
 * Automatically includes the auth token in headers if available
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { requireAuth = true, headers = {}, ...axiosOptions } = options;

  const authHeaders = await getAuthHeaders(requireAuth);

  const config: AxiosRequestConfig = {
    url: buildUrl(endpoint),
    method: (options.method as Method) || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers,
    },
    ...axiosOptions,
  };

  try {
    const response = await axios.request<T>(config);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;
      const message =
        data?.message ?? data?.error ?? error.message ?? `Request failed with status ${error.response?.status}`;
      throw new Error(message);
    }
    throw error;
  }
}

/**
 * GET request helper
 */
export async function apiGet<T = any>(
  endpoint: string,
  options?: Omit<ApiOptions, 'method' | 'data'>
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request helper
 */
export async function apiPost<T = any>(
  endpoint: string,
  body?: any,
  options?: Omit<ApiOptions, 'method' | 'data'>
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'POST',
    data: body,
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T = any>(
  endpoint: string,
  body?: any,
  options?: Omit<ApiOptions, 'method' | 'data'>
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'PUT',
    data: body,
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = any>(
  endpoint: string,
  options?: Omit<ApiOptions, 'method' | 'data'>
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
}

/**
 * POST request with FormData (for file uploads)
 * Content-Type is left unset so the client sets multipart/form-data with boundary
 */
export async function apiPostFormData<T = any>(
  endpoint: string,
  formData: FormData,
  options?: Omit<ApiOptions, 'method' | 'data' | 'headers'>
): Promise<T> {
  const { requireAuth = true, ...axiosOptions } = options || {};

  const authHeaders = await getAuthHeaders(requireAuth);

  const config: AxiosRequestConfig = {
    url: buildUrl(endpoint),
    method: 'POST',
    data: formData,
    headers: {
      ...authHeaders,
      // Do not set Content-Type – axios sets multipart/form-data with boundary
    },
    ...axiosOptions,
  };

  try {
    const response = await axios.request<T>(config);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;
      const message =
        data?.message ?? data?.error ?? error.message ?? `Request failed with status ${error.response?.status}`;
      throw new Error(message);
    }
    if (error?.message?.includes('Network') || error?.message?.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw new Error(`Failed to connect to server: ${error?.message || 'Unknown error'}`);
  }
}
