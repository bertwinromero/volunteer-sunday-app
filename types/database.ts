export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          middle_name: string | null
          last_name: string
          display_name: string | null
          role: 'admin' | 'volunteer'
          expo_push_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          middle_name?: string | null
          last_name: string
          display_name?: string | null
          role?: 'admin' | 'volunteer'
          expo_push_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          middle_name?: string | null
          last_name?: string
          display_name?: string | null
          role?: 'admin' | 'volunteer'
          expo_push_token?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      programs: {
        Row: {
          id: string
          title: string
          date: string
          status: 'draft' | 'active' | 'completed'
          created_by: string
          share_code: string | null
          share_token: string
          public_access_enabled: boolean
          active_participants_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          date: string
          status?: 'draft' | 'active' | 'completed'
          created_by: string
          share_code?: string | null
          share_token?: string
          public_access_enabled?: boolean
          active_participants_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          status?: 'draft' | 'active' | 'completed'
          created_by?: string
          share_code?: string | null
          share_token?: string
          public_access_enabled?: boolean
          active_participants_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      program_items: {
        Row: {
          id: string
          program_id: string
          time: string
          title: string
          description: string | null
          duration_minutes: number
          order: number
          has_task: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          program_id: string
          time: string
          title: string
          description?: string | null
          duration_minutes: number
          order: number
          has_task?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          program_id?: string
          time?: string
          title?: string
          description?: string | null
          duration_minutes?: number
          order?: number
          has_task?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          program_id: string
          program_item_id: string
          assigned_to: string
          status: 'pending' | 'completed'
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          program_id: string
          program_item_id: string
          assigned_to: string
          status?: 'pending' | 'completed'
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          program_id?: string
          program_item_id?: string
          assigned_to?: string
          status?: 'pending' | 'completed'
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      participant_roles: {
        Row: {
          id: string
          role_name: string
          description: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          role_name: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role_name?: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      program_participants: {
        Row: {
          id: string
          program_id: string
          user_id: string | null
          full_name: string
          role: string
          expo_push_token: string | null
          is_guest: boolean
          device_id: string | null
          joined_at: string
          last_active: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          program_id: string
          user_id?: string | null
          full_name: string
          role: string
          expo_push_token?: string | null
          is_guest?: boolean
          device_id?: string | null
          joined_at?: string
          last_active?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          program_id?: string
          user_id?: string | null
          full_name?: string
          role?: string
          expo_push_token?: string | null
          is_guest?: boolean
          device_id?: string | null
          joined_at?: string
          last_active?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
