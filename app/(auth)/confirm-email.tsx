import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface, Icon } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../services/supabase';

export default function ConfirmEmailScreen() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();

  const email = params.email as string;

  const handleResendEmail = async () => {
    if (!email) return;

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (error: any) {
      console.error('Error resending confirmation:', error);
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.card} elevation={2}>
        <View style={styles.iconContainer}>
          <Icon source="email-check-outline" size={80} color="#2196f3" />
        </View>

        <Text variant="headlineMedium" style={styles.title}>
          Check your email
        </Text>

        <Text variant="bodyLarge" style={styles.message}>
          We've sent a confirmation link to:
        </Text>

        <Text variant="titleMedium" style={styles.email}>
          {email}
        </Text>

        <Text variant="bodyMedium" style={styles.instructions}>
          Click the link in the email to verify your account and complete registration.
        </Text>

        <View style={styles.tipsContainer}>
          <Text variant="labelLarge" style={styles.tipsTitle}>
            Didn't receive it?
          </Text>
          <Text variant="bodySmall" style={styles.tip}>
            • Check your spam/junk folder
          </Text>
          <Text variant="bodySmall" style={styles.tip}>
            • Make sure you entered the correct email
          </Text>
          <Text variant="bodySmall" style={styles.tip}>
            • Wait a few minutes for the email to arrive
          </Text>
        </View>

        {resent && (
          <Surface style={styles.successBanner} elevation={0}>
            <Icon source="check-circle" size={20} color="#4caf50" />
            <Text variant="bodyMedium" style={styles.successText}>
              Confirmation email resent!
            </Text>
          </Surface>
        )}

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleResendEmail}
            loading={resending}
            disabled={resending || resent}
            icon="email-send-outline"
            style={styles.button}
          >
            {resent ? 'Email Sent!' : 'Resend Email'}
          </Button>

          <Button
            mode="text"
            onPress={() => router.replace('/(auth)/login')}
            style={styles.button}
          >
            Back to Sign In
          </Button>
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 8,
  },
  email: {
    textAlign: 'center',
    color: '#2196f3',
    marginBottom: 24,
  },
  instructions: {
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 32,
    lineHeight: 22,
  },
  tipsContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  tipsTitle: {
    marginBottom: 8,
    opacity: 0.9,
  },
  tip: {
    opacity: 0.7,
    marginBottom: 4,
    paddingLeft: 8,
  },
  successBanner: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#2e7d32',
    flex: 1,
  },
  actions: {
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
});
