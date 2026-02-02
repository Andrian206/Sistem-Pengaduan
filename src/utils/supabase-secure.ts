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

// User Interface (data yang di-return dari server, TANPA password)
export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  blok_rumah?: string;
  phone?: string;
  created_at?: string;
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
  user?: Pick<User, 'id' | 'email' | 'full_name' | 'blok_rumah'>;
}

// Auth Response dari server
export interface AuthResponse {
  success: boolean;
  error?: string;
  token?: string;
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
// SESSION TOKEN STORAGE (Secure)
// ============================================

const TOKEN_KEY = 'sapaikmp_token';

export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    // Simpan token saja, bukan user data
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// ============================================
// API FUNCTIONS (memanggil Supabase RPC)
// ============================================

/**
 * Login via server function (password hashed di server)
 */
export async function apiLogin(
  email: string, 
  password: string
): Promise<AuthResponse> {
  const { data, error } = await supabase.rpc('login_user', {
    p_email: email,
    p_password: password,
    p_ip_address: null,
    p_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
  });

  if (error) {
    console.error('Login RPC error:', error);
    return { success: false, error: 'Terjadi kesalahan server' };
  }

  return data as AuthResponse;
}

/**
 * Register via server function (password hashed di server)
 */
export async function apiRegister(
  email: string,
  password: string,
  fullName: string,
  blokRumah?: string,
  phone?: string
): Promise<AuthResponse> {
  const { data, error } = await supabase.rpc('register_user', {
    p_email: email,
    p_password: password,
    p_full_name: fullName,
    p_blok_rumah: blokRumah || null,
    p_phone: phone || null
  });

  if (error) {
    console.error('Register RPC error:', error);
    return { success: false, error: 'Terjadi kesalahan server' };
  }

  return data as AuthResponse;
}

/**
 * Verify session token
 */
export async function apiVerifySession(token: string): Promise<AuthResponse> {
  const { data, error } = await supabase.rpc('verify_session', {
    p_token: token
  });

  if (error) {
    console.error('Verify session RPC error:', error);
    return { success: false, error: 'Session tidak valid' };
  }

  return data as AuthResponse;
}

/**
 * Logout (invalidate session di server)
 */
export async function apiLogout(token: string): Promise<{ success: boolean }> {
  const { data, error } = await supabase.rpc('logout_user', {
    p_token: token
  });

  if (error) {
    console.error('Logout RPC error:', error);
  }

  return data || { success: true };
}

/**
 * Update ticket status via server (dengan audit log)
 */
export async function apiUpdateTicketStatus(
  token: string,
  ticketId: string,
  newStatus: TicketStatus
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('update_ticket_status', {
    p_token: token,
    p_ticket_id: ticketId,
    p_new_status: newStatus
  });

  if (error) {
    console.error('Update ticket RPC error:', error);
    return { success: false, error: 'Terjadi kesalahan server' };
  }

  return data;
}

/**
 * Delete ticket via server (dengan audit log)
 */
export async function apiDeleteTicket(
  token: string,
  ticketId: string
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('delete_ticket', {
    p_token: token,
    p_ticket_id: ticketId
  });

  if (error) {
    console.error('Delete ticket RPC error:', error);
    return { success: false, error: 'Terjadi kesalahan server' };
  }

  return data;
}

/**
 * Create ticket via server function (dengan audit log)
 */
export async function apiCreateTicket(
  token: string,
  title: string,
  description: string,
  imageUrl?: string | null
): Promise<{ success: boolean; error?: string; ticket_id?: string }> {
  const { data, error } = await supabase.rpc('create_ticket', {
    p_token: token,
    p_title: title,
    p_description: description,
    p_image_url: imageUrl || null
  });

  if (error) {
    console.error('Create ticket RPC error:', error);
    return { success: false, error: 'Terjadi kesalahan server' };
  }

  return data;
}
