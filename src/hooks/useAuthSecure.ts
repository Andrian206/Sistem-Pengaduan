"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  canAccessAdminPanel, 
  ROLE_PERMISSIONS,
  getToken,
  saveToken,
  clearToken,
  apiLogin,
  apiRegister,
  apiVerifySession,
  apiLogout,
  type User, 
  type UserRole 
} from "@/utils/supabase-secure";

interface AuthState {
  user: User | null;
  role: UserRole;
  token: string | null;
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
 * Custom hook untuk autentikasi AMAN
 * - Password di-hash di server (pgcrypto)
 * - Session token disimpan di localStorage
 * - Verifikasi session ke server setiap load
 */
export function useAuthSecure(options: UseAuthOptions = {}) {
  const { 
    requireAuth = false, 
    requireAdmin = false,
    redirectAdminToPanel = false 
  } = options;

  const [state, setState] = useState<AuthState>({
    user: null,
    role: 'warga',
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const router = useRouter();

  /**
   * Initialize - verify session token dari localStorage
   */
  const initAuth = useCallback(async () => {
    const savedToken = getToken();
    
    if (!savedToken) {
      setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
      
      if (requireAuth) {
        router.push('/login');
      }
      return;
    }

    // Verify token dengan server
    const result = await apiVerifySession(savedToken);

    if (!result.success || !result.user) {
      // Token tidak valid, hapus
      clearToken();
      setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
      
      if (requireAuth) {
        router.push('/login');
      }
      return;
    }

    const role = result.user.role || 'warga';

    setState({
      user: result.user,
      role,
      token: savedToken,
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
    const result = await apiLogin(email, password);

    if (!result.success || !result.user || !result.token) {
      return { success: false, error: result.error || 'Login gagal' };
    }

    // Simpan token
    saveToken(result.token);

    const role = result.user.role as UserRole;
    const permissions = ROLE_PERMISSIONS[role];

    setState({
      user: result.user,
      role,
      token: result.token,
      isLoading: false,
      isAuthenticated: true,
    });

    // Redirect berdasarkan role
    router.push(permissions.dashboardPath);
    return { success: true };
  }, [router]);

  /**
   * Register user baru
   */
  const register = useCallback(async (
    email: string, 
    password: string, 
    metadata: { full_name: string; blok_rumah: string; phone?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await apiRegister(
      email,
      password,
      metadata.full_name,
      metadata.blok_rumah,
      metadata.phone
    );

    if (!result.success) {
      return { success: false, error: result.error || 'Registrasi gagal' };
    }

    // Auto login setelah register
    return await login(email, password);
  }, [login]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    const currentToken = state.token || getToken();
    
    if (currentToken) {
      await apiLogout(currentToken);
    }
    
    clearToken();
    setState({
      user: null,
      role: 'warga',
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    router.push('/');
  }, [state.token, router]);

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

export default useAuthSecure;
