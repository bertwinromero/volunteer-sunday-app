import { supabase } from './supabase';
import { Program, ShareLink } from '../types';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

export const shareService = {
  /**
   * Get share link for a program
   */
  async getShareLink(programId: string): Promise<ShareLink | null> {
    const { data, error } = await supabase
      .from('programs')
      .select('id, share_code, share_token')
      .eq('id', programId)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Generate production-ready URL
    const url = shareService.generateShareUrl(data.share_token);

    return {
      programId: data.id,
      shareCode: data.share_code!,
      shareToken: data.share_token,
      url,
    };
  },

  /**
   * Generate share URL based on environment
   */
  generateShareUrl(token: string): string {
    // Check if running in Expo Go (development)
    const isExpoGo = Constants.appOwnership === 'expo';

    if (isExpoGo) {
      // Use Expo development URL
      return Linking.createURL(`/program/${token}`);
    } else {
      // Use custom URL scheme for production builds
      return `volunteerapp://program/${token}`;
    }
  },

  /**
   * Get program by share code
   */
  async getProgramByCode(code: string): Promise<Program | null> {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('share_code', code.toUpperCase())
      .eq('public_access_enabled', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  },

  /**
   * Get program by share token
   */
  async getProgramByToken(token: string): Promise<Program | null> {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('share_token', token)
      .eq('public_access_enabled', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  },

  /**
   * Regenerate share code for a program
   */
  async regenerateShareCode(programId: string): Promise<ShareLink> {
    // The database trigger will automatically generate a new code
    // when we update the share_code to null
    const { data, error } = await supabase
      .from('programs')
      .update({ share_code: null })
      .eq('id', programId)
      .select('id, share_code, share_token')
      .single();

    if (error) throw error;

    const url = shareService.generateShareUrl(data.share_token);

    return {
      programId: data.id,
      shareCode: data.share_code!,
      shareToken: data.share_token,
      url,
    };
  },

  /**
   * Enable or disable public access for a program
   */
  async setPublicAccess(programId: string, enabled: boolean): Promise<void> {
    const { error } = await supabase
      .from('programs')
      .update({ public_access_enabled: enabled })
      .eq('id', programId);

    if (error) throw error;
  },

  /**
   * Format share message
   */
  formatShareMessage(shareLink: ShareLink, programTitle: string): string {
    return `Join the "${programTitle}" program!\n\n` +
      `Code: ${shareLink.shareCode}\n` +
      `Or use this link: ${shareLink.url}\n\n` +
      `Open the Volunteer Sunday app and enter the code or tap the link to join.`;
  },
};
