import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';

/**
 * Deep link handler for program share links
 * Handles: volunteerapp://program/[token]
 */
export default function ProgramDeepLinkHandler() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = params.token as string;

  useEffect(() => {
    if (token) {
      // Redirect to guest join flow with token
      router.replace({
        pathname: '/(guest)/join',
        params: { token },
      });
    } else {
      // No token provided, go to home
      router.replace('/');
    }
  }, [token]);

  return (
    <View style={styles.container}>
      <Text>Loading program...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});
