"use client";

import { useState } from "react";
import { supabase, canAccessAdminPanel, ROLE_PERMISSIONS, type UserRole } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user?.id)
      .single();
    
    const userRole = (profile?.role as UserRole) || 'warga';
    const permissions = ROLE_PERMISSIONS[userRole];
    
    router.push(permissions.dashboardPath);
    setLoading(false);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col items-center justify-center p-6 antialiased font-display text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-[400px] bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-100 dark:border-slate-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-xl text-white mb-3 shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-3xl">home_pin</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-primary">SapaIKMP</h1>
        </div>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Selamat Datang Kembali</h2>
          <p className="text-slate-500 dark:text-slate-400">Masuk untuk melanjutkan</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label 
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1" 
              htmlFor="email"
            >
              Email
            </label>
            <input 
              id="email" 
              type="email" 
              required
              className="w-full h-12 px-4 bg-slate-100 dark:bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-primary text-slate-900 dark:text-white placeholder:text-slate-400 transition-all outline-none" 
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label 
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1" 
              htmlFor="password"
            >
              Password
            </label>
            <input 
              id="password" 
              type="password" 
              required
              className="w-full h-12 px-4 bg-slate-100 dark:bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-primary text-slate-900 dark:text-white placeholder:text-slate-400 transition-all outline-none"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <a className="text-xs font-medium text-primary hover:underline cursor-pointer">Lupa Password?</a>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-primary text-white font-bold rounded-full shadow-md shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-slate-800 px-3 text-slate-500 dark:text-slate-400 font-medium">Belum punya akun?</span>
          </div>
        </div>

        <div className="text-center">
          <Link href="/register" className="text-primary font-bold hover:underline">
            Daftar sebagai Warga
          </Link>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 text-center">
            🔐 Demo Login
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg">
              <span className="w-14 px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded text-[10px] font-bold text-center">USER</span>
              <div className="flex-1">
                <p className="text-slate-700 dark:text-slate-300 font-medium">usersapa123@gmail.com</p>
                <p className="text-slate-400 text-[10px]">pass: usersapa123</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg">
              <span className="w-14 px-1.5 py-0.5 bg-primary/20 text-primary rounded text-[10px] font-bold text-center">ADMIN</span>
              <div className="flex-1">
                <p className="text-slate-700 dark:text-slate-300 font-medium">adminsapa123@gmail.com</p>
                <p className="text-slate-400 text-[10px]">pass: adminsapa123</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg">
              <span className="w-14 px-1.5 py-0.5 bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-400 rounded text-[10px] font-bold text-center">RT</span>
              <div className="flex-1">
                <p className="text-slate-700 dark:text-slate-300 font-medium">pakrt123@gmail.com</p>
                <p className="text-slate-400 text-[10px]">pass: pakrt123</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg">
              <span className="w-14 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 rounded text-[10px] font-bold text-center">K.RT</span>
              <div className="flex-1">
                <p className="text-slate-700 dark:text-slate-300 font-medium">ketuart@gmail.com</p>
                <p className="text-slate-400 text-[10px]">pass: ketuart123</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link 
          href="/" 
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors font-medium"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}