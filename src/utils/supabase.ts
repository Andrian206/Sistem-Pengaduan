import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// User Roles
export type UserRole = 'admin' | 'rt' | 'ketua_rt' | 'warga';

// Ticket Status
export type TicketStatus = 'PENDING' | 'PROSES' | 'SELESAI';

// Ticket Interface
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  user_id: string;
  user_email: string | null;
  image_url: string | null;
  created_at: string;
  updated_at?: string;
}

// User Profile Interface
export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  blok_rumah?: string;
  phone?: string;
  created_at: string;
}

// Role Permissions
export const ROLE_PERMISSIONS: Record<UserRole, {
  canViewAllTickets: boolean;
  canUpdateStatus: boolean;
  canDeleteTicket: boolean;
  canCreateTicket: boolean;
  dashboardPath: string;
  label: string;
}> = {
  admin: {
    canViewAllTickets: true,
    canUpdateStatus: true,
    canDeleteTicket: true,
    canCreateTicket: false,
    dashboardPath: '/admin',
    label: 'Administrator'
  },
  rt: {
    canViewAllTickets: true,
    canUpdateStatus: false,
    canDeleteTicket: false,
    canCreateTicket: false,
    dashboardPath: '/admin',
    label: 'Kepala RT'
  },
  ketua_rt: {
    canViewAllTickets: true,
    canUpdateStatus: true,
    canDeleteTicket: false,
    canCreateTicket: false,
    dashboardPath: '/admin',
    label: 'Ketua RT'
  },
  warga: {
    canViewAllTickets: false,
    canUpdateStatus: false,
    canDeleteTicket: false,
    canCreateTicket: true,
    dashboardPath: '/dashboard',
    label: 'Warga'
  }
};

// Helper function to check if role can access admin panel
export function canAccessAdminPanel(role: UserRole): boolean {
  return role === 'admin' || role === 'rt' || role === 'ketua_rt';
}