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
    // Native: use SecureStore with error handling and timeout
    return {
      getItem: async (key: string) => {
        try {
          console.log('[StorageAdapter] Getting item:', key);
          const value = await Promise.race([
            SecureStore.getItemAsync(key),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
          ]);
          console.log('[StorageAdapter] Got item:', key, value ? 'Found' : 'None');
          return value;
        } catch (error) {
          console.error('[StorageAdapter] Error getting item:', key, error);
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          console.log('[StorageAdapter] Setting item:', key);
          await Promise.race([
            SecureStore.setItemAsync(key, value),
            new Promise<void>((resolve) => setTimeout(() => resolve(), 5000)),
          ]);
          console.log('[StorageAdapter] Set item:', key);
        } catch (error) {
          console.error('[StorageAdapter] Error setting item:', key, error);
        }
      },
      removeItem: async (key: string) => {
        try {
          console.log('[StorageAdapter] Removing item:', key);
          await Promise.race([
            SecureStore.deleteItemAsync(key),
            new Promise<void>((resolve) => setTimeout(() => resolve(), 5000)),
          ]);
          console.log('[StorageAdapter] Removed item:', key);
        } catch (error) {
          console.error('[StorageAdapter] Error removing item:', key, error);
        }
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
