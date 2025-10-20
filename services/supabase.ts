import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Database } from '../types/database';

// Get environment variables - EXPO_PUBLIC_ prefix makes them available in the app
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Validate that environment variables are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and restart the dev server.'
  );
}

// Platform-aware storage adapter
// Use SecureStore on native (iOS/Android), localStorage on web
const createStorageAdapter = () => {
  if (Platform.OS === 'web') {
    // Web: use localStorage
    return {
      getItem: async (key: string) => {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key);
        }
        return null;
      },
      setItem: async (key: string, value: string) => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        }
      },
      removeItem: async (key: string) => {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
      },
    };
  } else {
    // Native: use SecureStore
    return {
      getItem: (key: string) => {
        return SecureStore.getItemAsync(key);
      },
      setItem: (key: string, value: string) => {
        return SecureStore.setItemAsync(key, value);
      },
      removeItem: (key: string) => {
        return SecureStore.deleteItemAsync(key);
      },
    };
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createStorageAdapter() as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
