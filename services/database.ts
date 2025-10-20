import { supabase } from './supabase';
import {
  Program,
  ProgramInsert,
  ProgramUpdate,
  ProgramItem,
  ProgramItemInsert,
  ProgramItemUpdate,
  Task,
  TaskInsert,
  TaskUpdate,
  Profile,
  ParticipantRole,
  ParticipantRoleInsert,
  ParticipantRoleUpdate,
  ProgramParticipant,
  ProgramParticipantInsert,
  ProgramParticipantUpdate,
} from '../types';

export const databaseService = {
  // ============= PROGRAMS =============

  /**
   * Get all programs
   */
  async getPrograms(status?: string) {
    let query = supabase
      .from('programs')
      .select('*, program_items(*)')
      .order('date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Get a single program by ID
   */
  async getProgram(id: string) {
    const { data, error } = await supabase
      .from('programs')
      .select('*, program_items(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get today's active program
   */
  async getTodayProgram() {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('programs')
      .select('*, program_items(*)')
      .eq('date', today)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  },

  /**
   * Create a new program
   */
  async createProgram(program: ProgramInsert) {
    const { data, error } = await supabase
      .from('programs')
      .insert(program)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a program
   */
  async updateProgram(id: string, updates: ProgramUpdate) {
    const { data, error } = await supabase
      .from('programs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a program
   */
  async deleteProgram(id: string) {
    const { error } = await supabase
      .from('programs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Activate a program (set status to active and deactivate others on same date)
   */
  async activateProgram(id: string) {
    // Get the program first to know its date
    const program = await this.getProgram(id);

    // Deactivate other programs on the same date
    await supabase
      .from('programs')
      .update({ status: 'draft' })
      .eq('date', program.date)
      .eq('status', 'active');

    // Activate this program
    return this.updateProgram(id, { status: 'active' });
  },

  // ============= PROGRAM ITEMS =============

  /**
   * Get all program items for a program
   */
  async getProgramItems(programId: string) {
    const { data, error } = await supabase
      .from('program_items')
      .select('*')
      .eq('program_id', programId)
      .order('order', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Create a new program item
   */
  async createProgramItem(item: ProgramItemInsert) {
    const { data, error } = await supabase
      .from('program_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a program item
   */
  async updateProgramItem(id: string, updates: ProgramItemUpdate) {
    const { data, error } = await supabase
      .from('program_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a program item
   */
  async deleteProgramItem(id: string) {
    const { error } = await supabase
      .from('program_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Reorder program items
   */
  async reorderProgramItems(items: { id: string; order: number }[]) {
    const updates = items.map(item =>
      supabase
        .from('program_items')
        .update({ order: item.order })
        .eq('id', item.id)
    );

    await Promise.all(updates);
  },

  // ============= TASKS =============

  /**
   * Get all tasks for a program
   */
  async getProgramTasks(programId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, program_item:program_items(*), assigned_user:profiles(*)')
      .eq('program_id', programId);

    if (error) throw error;
    return data;
  },

  /**
   * Get tasks assigned to a user
   */
  async getUserTasks(userId: string, status?: string) {
    let query = supabase
      .from('tasks')
      .select('*, program_item:program_items(*), program:programs(*)')
      .eq('assigned_to', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Get today's tasks for a user
   */
  async getTodayUserTasks(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('tasks')
      .select('*, program_item:program_items(*), program:programs(*)')
      .eq('assigned_to', userId)
      .eq('program.date', today);

    if (error) throw error;
    return data;
  },

  /**
   * Create a new task
   */
  async createTask(task: TaskInsert) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a task
   */
  async updateTask(id: string, updates: TaskUpdate) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Mark task as completed
   */
  async completeTask(id: string) {
    return this.updateTask(id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  },

  /**
   * Delete a task
   */
  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ============= PROFILES =============

  /**
   * Get all volunteers
   */
  async getVolunteers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'volunteer')
      .order('display_name', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get all profiles
   */
  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('display_name', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get profile by ID
   */
  async getProfile(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // ============= PARTICIPANT ROLES =============

  /**
   * Get all active participant roles
   */
  async getParticipantRoles() {
    const { data, error } = await supabase
      .from('participant_roles')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Create a new participant role
   */
  async createParticipantRole(role: ParticipantRoleInsert) {
    const { data, error } = await supabase
      .from('participant_roles')
      .insert(role)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a participant role
   */
  async updateParticipantRole(id: string, updates: ParticipantRoleUpdate) {
    const { data, error } = await supabase
      .from('participant_roles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a participant role
   */
  async deleteParticipantRole(id: string) {
    const { error } = await supabase
      .from('participant_roles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ============= PROGRAM PARTICIPANTS =============

  /**
   * Get all participants for a program
   */
  async getProgramParticipants(programId: string) {
    const { data, error } = await supabase
      .from('program_participants')
      .select('*, profile:profiles(*)')
      .eq('program_id', programId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get active participants for a program (last active within 5 minutes)
   */
  async getActiveProgramParticipants(programId: string) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('program_participants')
      .select('*, profile:profiles(*)')
      .eq('program_id', programId)
      .gte('last_active', fiveMinutesAgo)
      .order('joined_at', { ascending: true});

    if (error) throw error;
    return data;
  },

  /**
   * Create a new program participant
   */
  async createProgramParticipant(participant: ProgramParticipantInsert) {
    const { data, error } = await supabase
      .from('program_participants')
      .insert(participant)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a program participant
   */
  async updateProgramParticipant(id: string, updates: ProgramParticipantUpdate) {
    const { data, error } = await supabase
      .from('program_participants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a program participant
   */
  async deleteProgramParticipant(id: string) {
    const { error } = await supabase
      .from('program_participants')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get user's participation history
   */
  async getUserParticipationHistory(userId: string) {
    const { data, error } = await supabase
      .from('program_participants')
      .select('*, program:programs(*)')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
