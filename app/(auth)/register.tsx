import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, RadioButton } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { UserRole } from '../../types';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('volunteer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signUp(
        email,
        password,
        firstName.trim(),
        middleName.trim() || null,
        lastName.trim(),
        role
      );
      // Redirect to email confirmation screen
      router.replace({
        pathname: '/(auth)/confirm-email',
        params: { email },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
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
          <Text variant="headlineLarge" style={styles.title}>
            Create Account
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Join the volunteer program
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="First Name *"
            value={firstName}
            onChangeText={setFirstName}
            mode="outlined"
            autoCapitalize="words"
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Middle Name (Optional)"
            value={middleName}
            onChangeText={setMiddleName}
            mode="outlined"
            autoCapitalize="words"
            style={styles.input}
            left={<TextInput.Icon icon="account-outline" />}
          />

          <TextInput
            label="Last Name *"
            value={lastName}
            onChangeText={setLastName}
            mode="outlined"
            autoCapitalize="words"
            style={styles.input}
            left={<TextInput.Icon icon="account-circle-outline" />}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            style={styles.input}
            left={<TextInput.Icon icon="lock-check" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <View style={styles.roleContainer}>
            <Text variant="bodyMedium" style={styles.roleLabel}>
              Account Type
            </Text>
            <RadioButton.Group onValueChange={value => setRole(value as UserRole)} value={role}>
              <View style={styles.radioItem}>
                <RadioButton value="volunteer" />
                <Text>Volunteer</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="admin" />
                <Text>Admin/Coordinator</Text>
              </View>
            </RadioButton.Group>
          </View>

          {error ? (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Sign Up
          </Button>

          <Button
            mode="text"
            onPress={() => router.push('/(auth)/login')}
            style={styles.linkButton}
          >
            Already have an account? Sign In
          </Button>
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
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  input: {
    marginBottom: 12,
  },
  roleContainer: {
    marginBottom: 12,
    marginTop: 8,
  },
  roleLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
  },
  linkButton: {
    marginTop: 8,
  },
});
