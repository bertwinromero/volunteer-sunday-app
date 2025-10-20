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
    primary: '#6200ee',
    secondary: '#03dac6',
  },
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
