import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // If user is already logged in, redirect to appropriate dashboard
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.replace('/(admin)/dashboard');
      } else {
        router.replace('/(volunteer)/home');
      }
    }
  }, [user, loading]);

  if (loading) {
    return null; // Or a loading spinner
  }

  // If user is logged in, don't show welcome screen
  if (user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* App Logo/Title */}
        <View style={styles.header}>
          <Text variant="displayMedium" style={styles.title}>
            Volunteer Sunday
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Stay in sync with your service program
          </Text>
        </View>

        {/* Action Cards */}
        <View style={styles.actionsContainer}>
          <Surface style={styles.card} elevation={2}>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Join a Program
            </Text>
            <Text variant="bodyMedium" style={styles.cardDescription}>
              Enter a code or use a link to join a live program
            </Text>
            <Button
              mode="contained"
              onPress={() => router.push('/(guest)/join')}
              style={styles.primaryButton}
              contentStyle={styles.buttonContent}
            >
              Join Program
            </Button>
          </Surface>

          <Surface style={styles.card} elevation={1}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Have an account?
            </Text>
            <View style={styles.authButtons}>
              <Button
                mode="outlined"
                onPress={() => router.push('/(auth)/login')}
                style={styles.authButton}
              >
                Sign In
              </Button>
              <Button
                mode="text"
                onPress={() => router.push('/(auth)/register')}
                style={styles.authButton}
              >
                Sign Up
              </Button>
            </View>
          </Surface>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text variant="bodySmall" style={styles.infoText}>
            With an account, you can receive task assignments, view your participation history, and customize your notification preferences.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  actionsContainer: {
    gap: 16,
  },
  card: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    opacity: 0.7,
    marginBottom: 16,
  },
  primaryButton: {
    paddingVertical: 6,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  authButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  authButton: {
    flex: 1,
  },
  infoSection: {
    marginTop: 24,
    paddingHorizontal: 8,
  },
  infoText: {
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 20,
  },
});
