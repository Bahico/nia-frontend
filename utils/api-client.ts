import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.0.100:8080/api';
const AUTH_TOKEN_KEY = '@auth_token';

export interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Make an authenticated API request
 * Automatically includes the auth token in headers if available
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { requireAuth = true, headers = {}, ...fetchOptions } = options;

  // Get auth token if required
  let authHeaders: HeadersInit = {};
  if (requireAuth) {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        authHeaders = {
          Authorization: `Bearer ${token}`,
        };
      } else if (requireAuth) {
        throw new Error('No authentication token found');
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
      if (requireAuth) {
        throw new Error('Authentication required');
      }
    }
  }

  // Build full URL
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Make request
  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers,
    },
  });

  // Handle response
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  let data: any;
  if (isJson) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = 
      data?.message || 
      data?.error || 
      `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * GET request helper
 */
export async function apiGet<T = any>(
  endpoint: string,
  options?: Omit<ApiOptions, 'method' | 'body'>
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request helper
 */
export async function apiPost<T = any>(
  endpoint: string,
  body?: any,
  options?: Omit<ApiOptions, 'method' | 'body'>
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T = any>(
  endpoint: string,
  body?: any,
  options?: Omit<ApiOptions, 'method' | 'body'>
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = any>(
  endpoint: string,
  options?: Omit<ApiOptions, 'method' | 'body'>
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
}

/**
 * POST request with FormData (for file uploads)
 * Automatically handles Content-Type header for multipart/form-data
 */
export async function apiPostFormData<T = any>(
  endpoint: string,
  formData: FormData,
  options?: Omit<ApiOptions, 'method' | 'body' | 'headers'>
): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options || {};

  // Get auth token if required
  let authHeaders: HeadersInit = {};
  if (requireAuth) {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        authHeaders = {
          Authorization: `Bearer ${token}`,
        };
      } else if (requireAuth) {
        throw new Error('No authentication token found');
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
      if (requireAuth) {
        throw new Error('Authentication required');
      }
    }
  }

  // Build full URL
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Make request - don't set Content-Type, let the browser/React Native set it with boundary
  let response: Response;
  try {
    console.log('working');
    
    response = await fetch(url, {
      ...fetchOptions,
      method: 'POST',
      body: formData,
      headers: {
        ...authHeaders,
        // Don't set Content-Type - let the browser/React Native set it automatically with boundary
      },
    });
  } catch (fetchError: any) {
    console.log(fetchError);
    
    // Handle network errors (connection issues, timeouts, etc.)
    console.error('Network error during FormData upload:', fetchError);
    if (fetchError?.message?.includes('Network') || fetchError?.message?.includes('fetch')) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw new Error(`Failed to connect to server: ${fetchError?.message || 'Unknown error'}`);
  }

  // Handle response
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  let data: any;
  try {
    if (isJson) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch (parseError) {
    console.error('Error parsing response:', parseError);
    throw new Error('Invalid response from server');
  }

  if (!response.ok) {
    const errorMessage = 
      data?.message || 
      data?.error || 
      `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}