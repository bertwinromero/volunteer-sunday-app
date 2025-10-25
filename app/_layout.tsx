import 'react-native-gesture-handler';
import 'react-native-reanimated';
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
    const inGuestGroup = segments[0] === '(guest)';
    const inAdminGroup = segments[0] === '(admin)';
    const inVolunteerGroup = segments[0] === '(volunteer)';
    const onIndexPage = segments.length === 0;
    const onProgramDeepLink = segments[0] === 'program';

    console.log('[NavigationProtector] Groups - Auth:', inAuthGroup, 'Guest:', inGuestGroup, 'Admin:', inAdminGroup, 'Volunteer:', inVolunteerGroup, 'Index:', onIndexPage, 'DeepLink:', onProgramDeepLink);

    // Allow access to public routes without authentication
    const publicRoutes = inAuthGroup || inGuestGroup || onIndexPage || onProgramDeepLink;

    if (!user && !publicRoutes) {
      // Redirect to welcome/index if trying to access protected routes
      console.log('[NavigationProtector] No user and not on public route, redirecting to index');
      router.replace('/');
    } else if (user && inAuthGroup) {
      // Redirect authenticated users away from auth screens
      console.log('[NavigationProtector] User in auth group, redirecting based on role:', user.role);
      if (user.role === 'admin') {
        router.replace('/(admin)/dashboard');
      } else {
        router.replace('/(volunteer)/home');
      }
    } else if (user && (inAdminGroup || inVolunteerGroup)) {
      // User is in correct protected area, do nothing
      console.log('[NavigationProtector] User in correct protected area');
    } else {
      console.log('[NavigationProtector] Allowing current navigation');
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
