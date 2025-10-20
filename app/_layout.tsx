import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { enGB, registerTranslation } from 'react-native-paper-dates';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Register date picker locale
registerTranslation('en', enGB);

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366F1', // Modern indigo
    primaryContainer: '#E0E7FF',
    secondary: '#8B5CF6', // Purple accent
    secondaryContainer: '#EDE9FE',
    tertiary: '#EC4899', // Pink accent
    tertiaryContainer: '#FCE7F3',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',
    error: '#EF4444',
    errorContainer: '#FEE2E2',
    success: '#10B981',
    successContainer: '#D1FAE5',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#111827',
    onSurface: '#111827',
    outline: '#E5E7EB',
  },
  roundness: 12,
};

function NavigationProtector() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log('[NavigationProtector] Loading:', loading, 'User:', user ? user.email : 'None', 'Segments:', segments);

    if (loading) {
      console.log('[NavigationProtector] Still loading, waiting...');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    console.log('[NavigationProtector] In auth group:', inAuthGroup);

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      console.log('[NavigationProtector] No user, redirecting to login');
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to appropriate home based on role
      console.log('[NavigationProtector] User in auth group, redirecting based on role:', user.role);
      if (user.role === 'admin') {
        router.replace('/(admin)/dashboard');
      } else {
        router.replace('/(volunteer)/home');
      }
    } else {
      console.log('[NavigationProtector] User authenticated, staying on current page');
    }
  }, [user, segments, loading]);

  if (loading) {
    console.log('[NavigationProtector] Rendering loading spinner');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  console.log('[NavigationProtector] Rendering Slot');
  return <Slot />;
}

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationProtector />
      </AuthProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
