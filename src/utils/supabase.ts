import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// TYPES
// ============================================

// User Roles
export type UserRole = 'admin' | 'rt' | 'ketua_rt' | 'warga';

// Ticket Status
export type TicketStatus = 'PENDING' | 'PROSES' | 'SELESAI';

// User Interface (tabel users - mengganti auth + profiles)
export interface User {
  id: string;
  email: string;
  password?: string; // Tidak diekspos ke frontend
  role: UserRole;
  full_name: string;
  blok_rumah?: string;
  phone?: string;
  created_at: string;
}

// Alias untuk kompatibilitas
export type UserProfile = User;

// Ticket Interface
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  user_id: string;
  image_url: string | null;
  created_at: string;
  updated_at?: string;
  // Join dengan user (opsional)
  user?: User;
}

// ============================================
// ROLE PERMISSIONS
// ============================================

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

// ============================================
// SESSION STORAGE (Simple localStorage-based)
// ============================================

const SESSION_KEY = 'sapaikmp_user';

export function saveSession(user: User): void {
  if (typeof window !== 'undefined') {
    // Jangan simpan password di session
    const { password, ...safeUser } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  }
}

export function getSession(): User | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(SESSION_KEY);
    if (data) {
      try {
        return JSON.parse(data) as User;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}