import { supabase } from './supabase';
import { Profile, UserRole } from '../types';

export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign up a new user
   */
  async signUp(
    email: string,
    password: string,
    firstName: string,
    middleName: string | null,
    lastName: string,
    role: UserRole = 'volunteer'
  ) {
    // Build display name
    const displayName = middleName
      ? `${firstName} ${middleName} ${lastName}`
      : `${firstName} ${lastName}`;

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          display_name: displayName.trim(),
          role: role,
        },
      },
    });

    if (authError) throw authError;

    // Profile is automatically created by database trigger (handle_new_user)
    // No need to manually insert here

    return authData;
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get the current user's profile
   */
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update the current user's profile
   */
  async updateProfile(updates: Partial<Profile>) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update user's expo push token
   */
  async updatePushToken(token: string) {
    return this.updateProfile({ expo_push_token: token });
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },
};
