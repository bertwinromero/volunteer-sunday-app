import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import Constants from 'expo-constants';

export default function DebugScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Debug Info</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Platform:</Text>
        <Text style={styles.value}>{Platform.OS}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Platform Version:</Text>
        <Text style={styles.value}>{Platform.Version}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Expo Version:</Text>
        <Text style={styles.value}>{Constants.expoConfig?.sdkVersion || 'N/A'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Supabase URL:</Text>
        <Text style={styles.value}>
          {process.env.EXPO_PUBLIC_SUPABASE_URL ? 'Loaded' : 'Missing'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Supabase Key:</Text>
        <Text style={styles.value}>
          {process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Loaded' : 'Missing'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Device:</Text>
        <Text style={styles.value}>{Constants.deviceName || 'Unknown'}</Text>
      </View>

      <Text style={styles.success}>
        ✅ App loaded successfully on {Platform.OS}!
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
  },
  section: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  success: {
    marginTop: 20,
    fontSize: 18,
    color: '#4caf50',
    textAlign: 'center',
    padding: 20,
  },
});
