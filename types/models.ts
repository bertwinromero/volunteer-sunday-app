import { Database } from './database';

// Type aliases for database tables
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Program = Database['public']['Tables']['programs']['Row'];
export type ProgramItem = Database['public']['Tables']['program_items']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type ParticipantRole = Database['public']['Tables']['participant_roles']['Row'];
export type ProgramParticipant = Database['public']['Tables']['program_participants']['Row'];

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProgramInsert = Database['public']['Tables']['programs']['Insert'];
export type ProgramItemInsert = Database['public']['Tables']['program_items']['Insert'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type ParticipantRoleInsert = Database['public']['Tables']['participant_roles']['Insert'];
export type ProgramParticipantInsert = Database['public']['Tables']['program_participants']['Insert'];

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type ProgramUpdate = Database['public']['Tables']['programs']['Update'];
export type ProgramItemUpdate = Database['public']['Tables']['program_items']['Update'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];
export type ParticipantRoleUpdate = Database['public']['Tables']['participant_roles']['Update'];
export type ProgramParticipantUpdate = Database['public']['Tables']['program_participants']['Update'];

// Extended types with relations
export interface ProgramWithItems extends Program {
  program_items: ProgramItem[];
}

export interface ProgramWithParticipants extends Program {
  program_participants: ProgramParticipant[];
}

export interface ProgramWithItemsAndParticipants extends Program {
  program_items: ProgramItem[];
  program_participants: ProgramParticipant[];
}

export interface ProgramItemWithTask extends ProgramItem {
  tasks: Task[];
}

export interface TaskWithDetails extends Task {
  program_item: ProgramItem;
  assigned_user: Profile;
}

export interface ProgramParticipantWithProfile extends ProgramParticipant {
  profile?: Profile;
}

// User roles
export type UserRole = 'admin' | 'volunteer';

// Program statuses
export type ProgramStatus = 'draft' | 'active' | 'completed';

// Recurrence patterns
export type RecurrencePattern = 'weekly' | 'biweekly' | 'monthly';

// Task statuses
export type TaskStatus = 'pending' | 'completed';

// Auth context type
export interface AuthContextType {
  user: Profile | null;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    middleName: string | null,
    lastName: string,
    role: UserRole
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

// Notification types
export interface NotificationData {
  type: 'service_starting' | 'next_item' | 'task_assigned' | 'program_updated';
  programId?: string;
  programItemId?: string;
  taskId?: string;
  title: string;
  body: string;
}

// Guest session types
export interface GuestSession {
  participantId: string;
  programId: string;
  fullName: string;
  role: string;
  deviceId: string;
  expoPushToken?: string;
  joinedAt: string;
}

// Share link types
export interface ShareLink {
  programId: string;
  shareCode: string;
  shareToken: string;
  url: string;
}

export interface JoinProgramRequest {
  programId?: string;
  shareCode?: string;
  shareToken?: string;
  fullName: string;
  role: string;
  expoPushToken?: string;
  deviceId: string;
}
