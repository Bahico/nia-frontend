import { API_BASE_URL } from "@/constants/api-url";
import { apiGet } from "@/utils/api-client";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const AUTH_STORAGE_KEY = '@auth_user';
const AUTH_TOKEN_KEY = '@auth_token';

export interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedUser, storedToken] = await Promise.all([
        AsyncStorage.getItem(AUTH_STORAGE_KEY),
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
      ]);
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      // Basic validation
      if (!username || !password) {
        throw new Error('Username and password are required');
      }

      // Call backend API
      const response = await fetch(`${API_BASE_URL}/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      let data: any;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Login failed');
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Login failed');
      }


      const authToken = data.id_token || data.token || data.accessToken || data.access_token;

      if (!authToken) {
        throw new Error('No authentication token received from server');
      }

      await Promise.all([
        // AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData)),
        AsyncStorage.setItem(AUTH_TOKEN_KEY, authToken),
      ]);

      const userDataRes = await apiGet(`/account`);
      const userData: User = userDataRes;
      console.log(userData, 'aaaaaa');

      AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData)),

      setUser(userData);
      setToken(authToken);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and ensure the server is running.');
      }
      // Re-throw if it's already an Error with a message
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to connect to server. Please try again.');
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      // Basic validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Call backend API for registration
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name?.trim(),
        }),
      });

      let data: any;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Registration failed');
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Registration failed');
      }


      const authToken = data.id_token || data.token || data.accessToken || data.access_token;

      if (!authToken) {
        throw new Error('No authentication token received from server');
      }

      await Promise.all([
        AsyncStorage.setItem(AUTH_TOKEN_KEY, authToken),
      ]);

      const userDataRes = await apiGet(`/account`);
      const userData: User = userDataRes;
      console.log(userData, 'aaaaaa');

      AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData)),

      setUser(userData);
      setToken(authToken);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Registration error:', error);
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and ensure the server is running.');
      }
      // Re-throw if it's already an Error with a message
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to connect to server. Please try again.');
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(AUTH_STORAGE_KEY),
        AsyncStorage.removeItem(AUTH_TOKEN_KEY),
      ]);
      setUser(null);
      setToken(null);
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
