"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    block: "",
    houseNumber: "",
    whatsapp: "",
    email: "",
    password: "",
    confirmPassword: "",
    startTerm: false
  });
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      alert("Password dan Konfirmasi Password tidak sama!");
      setLoading(false);
      return;
    }

    if (!formData.startTerm) {
      alert("Silakan setujui syarat dan ketentuan.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          block: formData.block,
          house_number: formData.houseNumber,
          whatsapp: formData.whatsapp,
        },
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Registrasi berhasil! Silakan cek email untuk verifikasi.");
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-6 antialiased font-display text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-[450px]">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 md:p-10 border border-slate-100 dark:border-slate-700">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl text-white shadow-lg shadow-primary/30">
                <span className="material-symbols-outlined text-2xl">home_pin</span>
              </div>
              <span className="text-xl font-black tracking-tight text-primary">SapaIKMP</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Daftar Akun Warga</h1>
            <p className="text-slate-500 dark:text-slate-400 text-center">Lengkapi data untuk verifikasi keanggotaan</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Nama Lengkap (sesuai KTP)</label>
              <input
                name="fullName"
                type="text"
                required
                placeholder="Contoh: Budi Santoso"
                className="w-full h-[48px] px-4 bg-slate-100 dark:bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-600 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Blok</label>
                <input
                  name="block"
                  type="text"
                  required
                  placeholder="Contoh: C"
                  className="w-full h-[48px] px-4 bg-slate-100 dark:bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-600 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
                  value={formData.block}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Nomor Rumah</label>
                <input
                  name="houseNumber"
                  type="text"
                  required
                  placeholder="Contoh: 12"
                  className="w-full h-[48px] px-4 bg-slate-100 dark:bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-600 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
                  value={formData.houseNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">No. WhatsApp</label>
              <input
                name="whatsapp"
                type="tel"
                required
                placeholder="08xxxxxxxxxx"
                className="w-full h-[48px] px-4 bg-slate-100 dark:bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-600 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
                value={formData.whatsapp}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="nama@email.com"
                className="w-full h-[48px] px-4 bg-slate-100 dark:bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-600 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full h-[48px] px-4 bg-slate-100 dark:bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-600 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none pr-12"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">visibility</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Konfirmasi Password</label>
              <input
                name="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                className="w-full h-[48px] px-4 bg-slate-100 dark:bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-600 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-start gap-3 pt-2">
              <div className="flex items-center h-5">
                <input
                  name="startTerm"
                  id="privacy"
                  type="checkbox"
                  required
                  className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary focus:ring-offset-0 cursor-pointer"
                  checked={formData.startTerm}
                  onChange={handleChange}
                />
              </div>
              <label className="text-xs text-slate-500 dark:text-slate-400 leading-normal cursor-pointer" htmlFor="privacy">
                Saya menyetujui data saya digunakan untuk keperluan verifikasi pengurus IKMP dan menyetujui <a href="#" className="text-primary font-semibold hover:underline">kebijakan privasi</a>.
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] bg-warning hover:bg-[#d95b03] text-white font-bold rounded-full shadow-md shadow-warning/20 transition-all mt-6 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sudah punya akun?
              <Link href="/login" className="text-primary font-bold hover:underline ml-1">
                Masuk
              </Link>
            </p>
          </div>
        </div>
        <p className="text-center text-slate-400 text-[13px] mt-8">
          Copyright © 2024 SapaIKMP - Kelola Aspirasi Warga.
        </p>
      </div>
    </div>
  );
}
