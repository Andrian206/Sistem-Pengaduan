"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  supabase, 
  canAccessAdminPanel, 
  ROLE_PERMISSIONS, 
  saveSession, 
  getSession, 
  clearSession,
  type User, 
  type UserRole 
} from "@/utils/supabase";

interface AuthState {
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface UseAuthOptions {
  /** Redirect ke login jika tidak authenticated */
  requireAuth?: boolean;
  /** Redirect ke dashboard jika bukan admin/rt/ketua_rt */
  requireAdmin?: boolean;
  /** Redirect ke admin jika user adalah admin/rt/ketua_rt */
  redirectAdminToPanel?: boolean;
}

/**
 * Custom hook untuk autentikasi SEDERHANA (tanpa Supabase Auth)
 * Menggunakan tabel `users` biasa dengan localStorage session
 */
export function useAuth(options: UseAuthOptions = {}) {
  const { 
    requireAuth = false, 
    requireAdmin = false,
    redirectAdminToPanel = false 
  } = options;

  const [state, setState] = useState<AuthState>({
    user: null,
    role: 'warga',
    isLoading: true,
    isAuthenticated: false,
  });

  const router = useRouter();

  /**
   * Initialize - cek session dari localStorage
   */
  const initAuth = useCallback(() => {
    const savedUser = getSession();
    
    if (!savedUser) {
      setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
      
      if (requireAuth) {
        router.push('/login');
      }
      return;
    }

    const role = savedUser.role || 'warga';

    setState({
      user: savedUser,
      role,
      isLoading: false,
      isAuthenticated: true,
    });

    // Handle redirects based on role
    if (requireAdmin && !canAccessAdminPanel(role)) {
      router.push('/dashboard');
      return;
    }

    if (redirectAdminToPanel && canAccessAdminPanel(role)) {
      router.push('/admin');
      return;
    }
  }, [requireAuth, requireAdmin, redirectAdminToPanel, router]);

  /**
   * Login dengan email dan password
   */
  const login = useCallback(async (
    email: string, 
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Query ke tabel users
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('password', password) // Untuk demo. Production: gunakan hash!
        .single();

      if (error || !user) {
        return { success: false, error: 'Email atau password salah.' };
      }

      // Simpan session
      saveSession(user);

      const role = user.role as UserRole;
      const permissions = ROLE_PERMISSIONS[role];

      setState({
        user,
        role,
        isLoading: false,
        isAuthenticated: true,
      });

      // Redirect berdasarkan role
      router.push(permissions.dashboardPath);
      return { success: true };

    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, error: 'Terjadi kesalahan. Silakan coba lagi.' };
    }
  }, [router]);

  /**
   * Register user baru
   */
  const register = useCallback(async (
    email: string, 
    password: string, 
    metadata: { full_name: string; blok_rumah: string; phone?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Cek apakah email sudah terdaftar
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (existing) {
        return { success: false, error: 'Email sudah terdaftar.' };
      }

      // Insert user baru
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: email.toLowerCase().trim(),
          password: password, // Untuk demo. Production: gunakan hash!
          role: 'warga',
          full_name: metadata.full_name,
          blok_rumah: metadata.blok_rumah,
          phone: metadata.phone
        })
        .select()
        .single();

      if (error) {
        console.error('Register error:', error);
        return { success: false, error: 'Gagal mendaftar. Silakan coba lagi.' };
      }

      // Simpan session & redirect
      saveSession(newUser);

      setState({
        user: newUser,
        role: 'warga',
        isLoading: false,
        isAuthenticated: true,
      });

      router.push('/dashboard');
      return { success: true };

    } catch (err: any) {
      console.error('Register error:', err);
      return { success: false, error: 'Terjadi kesalahan. Silakan coba lagi.' };
    }
  }, [router]);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    clearSession();
    setState({
      user: null,
      role: 'warga',
      isLoading: false,
      isAuthenticated: false,
    });
    router.push('/');
  }, [router]);

  // Initialize on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Get permissions based on current role
  const permissions = ROLE_PERMISSIONS[state.role];

  return {
    // State
    ...state,
    permissions,
    
    // Actions
    login,
    logout,
    register,
    
    // Helpers
    canAccessAdmin: canAccessAdminPanel(state.role),
  };
}

export default useAuth;
