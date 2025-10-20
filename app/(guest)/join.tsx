import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { shareService } from '../../services/shareService';

export default function JoinProgramScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useLocalSearchParams();

  // Handle deep link with share token
  useEffect(() => {
    if (params.token) {
      // Deep link with token, bypass code entry
      handleJoinByToken(params.token as string);
    }
  }, [params.token]);

  const handleJoinByToken = async (token: string) => {
    setLoading(true);
    setError('');

    try {
      const program = await shareService.getProgramByToken(token);

      if (!program) {
        setError('Program not found or link has expired');
        return;
      }

      // Navigate to details screen with program ID
      router.push({
        pathname: '/(guest)/details',
        params: { programId: program.id, programTitle: program.title },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to join program');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!code || code.length < 6) {
      setError('Please enter a valid 6-character code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const program = await shareService.getProgramByCode(code.toUpperCase());

      if (!program) {
        setError('Program not found. Please check the code and try again.');
        return;
      }

      // Navigate to details screen with program ID
      router.push({
        pathname: '/(guest)/details',
        params: { programId: program.id, programTitle: program.title },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to join program');
    } finally {
      setLoading(false);
    }
  };

  const formatCode = (text: string) => {
    // Remove non-alphanumeric characters and convert to uppercase
    const cleaned = text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    // Limit to 6 characters
    return cleaned.substring(0, 6);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>
            Join a Program
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Enter the 6-character code shared by your coordinator
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Program Code"
            value={code}
            onChangeText={(text) => setCode(formatCode(text))}
            mode="outlined"
            style={styles.input}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            placeholder="ABC123"
            left={<TextInput.Icon icon="ticket-confirmation-outline" />}
            error={!!error}
            disabled={loading}
          />

          <HelperText type="info" visible={code.length > 0 && code.length < 6}>
            {6 - code.length} more character{6 - code.length !== 1 ? 's' : ''} needed
          </HelperText>

          {error ? (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleJoinByCode}
            loading={loading}
            disabled={loading || code.length < 6}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Continue
          </Button>

          <Button
            mode="text"
            onPress={() => router.back()}
            disabled={loading}
            style={styles.backButton}
          >
            Back to Welcome
          </Button>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text variant="bodySmall" style={styles.dividerText}>
            OR
          </Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.infoSection}>
          <Text variant="bodyMedium" style={styles.infoTitle}>
            Have a link?
          </Text>
          <Text variant="bodySmall" style={styles.infoText}>
            If you received a link, simply tap on it to join the program automatically.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    opacity: 0.7,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 4,
    fontSize: 18,
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backButton: {
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    opacity: 0.5,
  },
  infoSection: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  infoTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
});
