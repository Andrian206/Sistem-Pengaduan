"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import Link from "next/link";

export default function LandingPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });
      
      // Debug: Log untuk melihat hasil query
      console.log('=== DEBUG LANDING PAGE ===');
      console.log('Tickets data:', data);
      console.log('Tickets error:', error);
      console.log('Tickets count:', data?.length);
      
      if (data) setTickets(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Hitung Statistik Realtime
  const stats = {
    total: tickets.length,
    process: tickets.filter((t) => t.status === "PROSES").length,
    done: tickets.filter((t) => t.status === "SELESAI").length,
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased min-h-screen">
      {/* TopNavBar */}
      <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl text-white">
              <span className="material-symbols-outlined text-2xl">
                home_pin
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-primary">
              SapaIKMP
            </h2>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <a
              href="#"
              className="text-sm font-semibold hover:text-primary transition-colors"
            >
              Tentang
            </a>
            <a
              href="#"
              className="text-sm font-semibold hover:text-primary transition-colors"
            >
              Alur
            </a>
            <a
              href="#"
              className="text-sm font-semibold hover:text-primary transition-colors"
            >
              Kontak
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="px-6 py-2.5 text-sm font-bold border-2 border-primary text-primary rounded-full hover:bg-primary/5 transition-all">
                Masuk
              </button>
            </Link>
            <Link href="/register">
              <button className="px-6 py-2.5 text-sm font-bold bg-primary text-white rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                Daftar Warga
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* HeroSection */}
      <section className="hero-gradient pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black text-slate-800 dark:text-white leading-[1.1] mb-6">
            Wujudkan Lingkungan IKMP yang Nyaman & Aman
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            Sampaikan aspirasi atau keluhan Anda. Kami dengar, kami tindak
            lanjuti demi kenyamanan bersama.
          </p>
          <Link href="/dashboard">
            <button className="inline-flex items-center gap-3 px-8 py-5 bg-warning text-white text-lg font-bold rounded-full shadow-xl shadow-warning/30 hover:shadow-warning/50 hover:-translate-y-1 transition-all">
              <span className="material-symbols-outlined">campaign</span>
              <span>Buat Laporan Baru</span>
            </button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 -mt-12 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">
                description
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">
              Total Laporan
            </p>
            <p className="text-4xl font-black text-slate-900 dark:text-white">
              {loading ? "..." : stats.total}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-warning/10 text-warning rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">
                pending_actions
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">
              Sedang Proses
            </p>
            <p className="text-4xl font-black text-slate-900 dark:text-white">
              {loading ? "..." : stats.process}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-success/10 text-success rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">
                task_alt
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">
              Selesai
            </p>
            <p className="text-4xl font-black text-slate-900 dark:text-white">
              {loading ? "..." : stats.done}
            </p>
          </div>
        </div>
      </section>

      {/* Reports Section */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white">
            Laporan Terkini
          </h2>
          {/* Chips/Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <button className="flex shrink-0 items-center gap-2 px-5 py-2 rounded-full bg-primary text-white text-sm font-bold">
              Semua
              <span className="material-symbols-outlined text-lg">
                keyboard_arrow_down
              </span>
            </button>
            <button className="flex shrink-0 items-center gap-2 px-5 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:border-primary transition-colors">
              Terbaru
              <span className="material-symbols-outlined text-lg">sort</span>
            </button>
            <button className="flex shrink-0 items-center gap-2 px-5 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:border-primary transition-colors">
              Diproses
            </button>
            <button className="flex shrink-0 items-center gap-2 px-5 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:border-primary transition-colors">
              Selesai
            </button>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.length === 0 && !loading ? (
             <div className="col-span-2 text-center py-10 text-slate-500">
               Belum ada laporan. Jadilah yang pertama melapor!
             </div>
          ) : (
            tickets.slice(0, 4).map((t) => (
              /* Report Card */
              <div
                key={t.id}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      t.status === "SELESAI"
                        ? "bg-success/10 text-success"
                        : t.status === "PROSES"
                        ? "bg-warning/10 text-warning"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {t.status === "PENDING" ? "Menunggu" : t.status === "PROSES" ? "Sedang Proses" : "Selesai"}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(t.created_at).toLocaleDateString("id-ID", {
                        day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                  {t.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-6">
                  {t.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-sm">
                      location_on
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Blok A
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400 italic">
                      Pelapor:{" "}
                    </span>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      {t.user_email?.split('@')[0] || "Anonim"}***
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-12 text-center">
          <Link href="/dashboard">
            <button className="px-10 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-2 mx-auto">
                Lihat Semua Laporan
                <span className="material-symbols-outlined text-lg">
                arrow_forward
                </span>
            </button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 py-10 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              home_pin
            </span>
            <span className="font-black text-slate-800 dark:text-white">
              SapaIKMP
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Copyright © 2024 SapaIKMP - Kelola Aspirasi Warga.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-slate-400 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">public</span>
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">mail</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}