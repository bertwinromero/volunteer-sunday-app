import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { supabase } from './supabase';
import {
  GuestSession,
  JoinProgramRequest,
  ProgramParticipant,
  ProgramParticipantInsert,
  ParticipantRole,
} from '../types';

const GUEST_SESSION_KEY = '@guest_session';
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export const participantService = {
  /**
   * Join a program as a guest or registered user
   */
  async joinProgram(request: JoinProgramRequest): Promise<ProgramParticipant> {
    const { data: { user } } = await supabase.auth.getUser();

    const participantData: ProgramParticipantInsert = {
      program_id: request.programId!,
      user_id: user?.id || null,
      full_name: request.fullName,
      role: request.role,
      expo_push_token: request.expoPushToken || null,
      is_guest: !user,
      device_id: request.deviceId,
    };

    const { data, error } = await supabase
      .from('program_participants')
      .insert(participantData)
      .select()
      .single();

    if (error) throw error;

    // Save guest session if not authenticated
    if (!user) {
      const guestSession: GuestSession = {
        participantId: data.id,
        programId: data.program_id,
        fullName: data.full_name,
        role: data.role,
        deviceId: data.device_id!,
        expoPushToken: data.expo_push_token || undefined,
        joinedAt: data.joined_at,
      };

      await AsyncStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(guestSession));
    }

    // Update participant count
    await this.updateParticipantCount(request.programId!);

    return data;
  },

  /**
   * Get current guest session from storage
   */
  async getGuestSession(): Promise<GuestSession | null> {
    try {
      const sessionJson = await AsyncStorage.getItem(GUEST_SESSION_KEY);
      if (!sessionJson) return null;

      return JSON.parse(sessionJson);
    } catch (error) {
      console.error('Error loading guest session:', error);
      return null;
    }
  },

  /**
   * Clear guest session from storage
   */
  async clearGuestSession(): Promise<void> {
    await AsyncStorage.removeItem(GUEST_SESSION_KEY);
  },

  /**
   * Update last_active timestamp for participant
   */
  async updateLastActive(participantId: string): Promise<void> {
    const { error } = await supabase
      .from('program_participants')
      .update({ last_active: new Date().toISOString() })
      .eq('id', participantId);

    if (error) throw error;
  },

  /**
   * Start heartbeat to keep participant active
   */
  startHeartbeat(participantId: string): NodeJS.Timeout {
    return setInterval(async () => {
      try {
        await this.updateLastActive(participantId);
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    }, HEARTBEAT_INTERVAL);
  },

  /**
   * Stop heartbeat
   */
  stopHeartbeat(intervalId: NodeJS.Timeout): void {
    clearInterval(intervalId);
  },

  /**
   * Get all participants for a program
   */
  async getParticipants(programId: string): Promise<ProgramParticipant[]> {
    const { data, error } = await supabase
      .from('program_participants')
      .select('*')
      .eq('program_id', programId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get active participants (last active within 5 minutes)
   */
  async getActiveParticipants(programId: string): Promise<ProgramParticipant[]> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('program_participants')
      .select('*')
      .eq('program_id', programId)
      .gte('last_active', fiveMinutesAgo)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Update participant count for a program
   */
  async updateParticipantCount(programId: string): Promise<void> {
    const participants = await this.getActiveParticipants(programId);

    const { error } = await supabase
      .from('programs')
      .update({ active_participants_count: participants.length })
      .eq('id', programId);

    if (error) throw error;
  },

  /**
   * Get all available participant roles
   */
  async getParticipantRoles(): Promise<ParticipantRole[]> {
    const { data, error } = await supabase
      .from('participant_roles')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get device ID
   */
  async getDeviceId(): Promise<string> {
    // Try to get from storage first
    const stored = await AsyncStorage.getItem('@device_id');
    if (stored) return stored;

    // Generate new device ID
    const deviceId = `${Device.modelName || 'unknown'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem('@device_id', deviceId);

    return deviceId;
  },

  /**
   * Leave a program (for cleanup)
   */
  async leaveProgram(participantId: string, programId: string): Promise<void> {
    // Don't delete the record, just update last_active to past time
    // This keeps the participation history
    const pastTime = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('program_participants')
      .update({ last_active: pastTime })
      .eq('id', participantId);

    if (error) throw error;

    // Update participant count
    await this.updateParticipantCount(programId);
  },
};
