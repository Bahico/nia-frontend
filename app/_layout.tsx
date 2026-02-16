import 'react-native-reanimated';

import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { ThemedView } from '@/components/themed-view';
import { initI18n } from '@/i18n';
import '../global.css';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [localeReady, setLocaleReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setLocaleReady(true));
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inAuthScreen = segments[0] === 'login' || segments[0] === 'register';

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      if (inAuthGroup) {
        router.replace('/login');
      } else if (!inAuthScreen) {
        router.replace('/login');
      }
    } else if (isAuthenticated) {
      // Redirect to tabs if authenticated but on auth screens
      if (inAuthScreen) {
        router.replace('/(tabs)');
      } else if (segments.length === 0) {
        // Initial load - redirect to tabs
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading, segments]);

  if (!localeReady || isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F6E34C" />
      </ThemedView>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="note/[id]" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
