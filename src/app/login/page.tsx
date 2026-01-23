"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";
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
    // Coba Login
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
       // Jika gagal login biasa, kita tidak otomatis sign up lagi demi keamanan yang lebih standar
       // (Kecuali Anda memang ingin fitur auto-signup itu tetap ada, kabari saya)
      alert(error.message);
    } else {
      // Login Sukses -> Lempar ke Dashboard
      router.push("/dashboard");
    }
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