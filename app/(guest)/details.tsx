import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, RadioButton, Surface } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { participantService } from '../../services/participantService';
import { ParticipantRole } from '../../types';
import * as Notifications from 'expo-notifications';

export default function GuestDetailsScreen() {
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [roles, setRoles] = useState<ParticipantRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useLocalSearchParams();

  const programId = params.programId as string;
  const programTitle = params.programTitle as string;

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const rolesData = await participantService.getParticipantRoles();
      setRoles(rolesData);
      // Auto-select first role if available
      if (rolesData.length > 0) {
        setSelectedRole(rolesData[0].role_name);
      }
    } catch (err) {
      console.error('Error loading roles:', err);
      setError('Failed to load roles');
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleJoin = async () => {
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!selectedRole) {
      setError('Please select your role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get device ID
      const deviceId = await participantService.getDeviceId();

      // Request notification permissions (optional)
      let expoPushToken: string | undefined;

      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          const tokenData = await Notifications.getExpoPushTokenAsync();
          expoPushToken = tokenData.data;
        }
      } catch (notifError) {
        // Notifications not available or projectId not configured
        // Continue without push token - notifications won't work but app will function
        console.log('Push notifications not available:', notifError);
      }

      // Join the program
      const participant = await participantService.joinProgram({
        programId,
        fullName: fullName.trim(),
        role: selectedRole,
        deviceId,
        expoPushToken,
      });

      // Navigate to program view
      router.replace({
        pathname: '/(guest)/program/[id]',
        params: {
          id: programId,
          participantId: participant.id,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to join program');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Join {programTitle}
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Enter your details to join the program
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Full Name *"
            value={fullName}
            onChangeText={setFullName}
            mode="outlined"
            autoCapitalize="words"
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
            error={!!error && !fullName.trim()}
            disabled={loading}
          />

          <View style={styles.roleContainer}>
            <Text variant="titleMedium" style={styles.roleLabel}>
              Your Role *
            </Text>

            {loadingRoles ? (
              <Text variant="bodyMedium" style={styles.loadingText}>
                Loading roles...
              </Text>
            ) : (
              <RadioButton.Group
                onValueChange={setSelectedRole}
                value={selectedRole}
              >
                {roles.map((role) => (
                  <Surface key={role.id} style={styles.roleItem} elevation={0}>
                    <RadioButton.Item
                      label={role.role_name}
                      value={role.role_name}
                      disabled={loading}
                      style={styles.radioItem}
                      labelStyle={styles.radioLabel}
                    />
                    {role.description && (
                      <Text variant="bodySmall" style={styles.roleDescription}>
                        {role.description}
                      </Text>
                    )}
                  </Surface>
                ))}
              </RadioButton.Group>
            )}
          </View>

          {error ? (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleJoin}
            loading={loading}
            disabled={loading || loadingRoles || !fullName.trim() || !selectedRole}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Join Program
          </Button>

          <Button
            mode="text"
            onPress={() => router.back()}
            disabled={loading}
            style={styles.backButton}
          >
            Back
          </Button>
        </View>

        <View style={styles.infoSection}>
          <Text variant="bodySmall" style={styles.infoText}>
            By joining, you'll receive notifications about the program flow and what's coming next.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
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
    marginBottom: 24,
  },
  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    marginBottom: 12,
    fontWeight: '600',
  },
  loadingText: {
    opacity: 0.5,
    textAlign: 'center',
    paddingVertical: 20,
  },
  roleItem: {
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  radioItem: {
    paddingVertical: 4,
  },
  radioLabel: {
    fontSize: 16,
  },
  roleDescription: {
    marginLeft: 56,
    marginTop: -8,
    marginBottom: 8,
    opacity: 0.6,
    lineHeight: 18,
  },
  button: {
    marginTop: 24,
    paddingVertical: 6,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backButton: {
    marginTop: 8,
  },
  infoSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  infoText: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
});
