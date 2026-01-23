"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Plus, Filter } from "lucide-react";
import Link from "next/link";

export default function GuestHome() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 1. Fetch Data dari Supabase
  useEffect(() => {
    async function fetchData() {
      // Ambil data tickets, urutkan dari yg terbaru
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setTickets(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  // 2. Filter Logic Sederhana
  const filteredTickets = tickets.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background font-sans text-text pb-20">
      
      {/* === HEADER (Google Style) === */}
      <header className="bg-surface sticky top-0 z-10 px-6 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo Sederhana */}
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">L</div>
          <span className="font-bold text-xl tracking-tight text-primary">LaporAja</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-secondary">
              Masuk / Daftar
            </Button>
          </Link>
        </div>
      </header>

      {/* === HERO SECTION === */}
      <main className="max-w-4xl mx-auto px-6 mt-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-text">
            Ada masalah apa hari ini?
          </h1>
          <p className="text-gray-500 mb-8 text-lg">
            Sampaikan keluhanmu, kami akan menyelesaikannya.
          </p>

          {/* Search Bar (Pill Shape) */}
          <div className="relative max-w-lg mx-auto shadow-md rounded-full">
            <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <Input 
              className="pl-12 h-12 rounded-full border-none bg-surface text-lg focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Cari keluhan (misal: AC Panas)..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* === GRID STATUS (Pemisah) === */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Laporan Terbaru</h2>
          <Button variant="ghost" className="text-primary hover:bg-secondary rounded-full">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>

        {/* === LIST LAPORAN (Card View) === */}
        {loading ? (
          <p className="text-center py-10 text-gray-500">Memuat data...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="p-5 rounded-lg border-none shadow-sm hover:shadow-md transition-all bg-surface cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <Badge 
                    className={`rounded-full px-3 py-1 font-normal ${
                      ticket.status === 'SELESAI' ? 'bg-accent text-white' : 
                      ticket.status === 'PROSES' ? 'bg-yellow-400 text-black' : 
                      'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {ticket.status}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-primary">{ticket.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{ticket.description}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
                    {ticket.user_email ? ticket.user_email[0].toUpperCase() : 'U'}
                  </div>
                  <span>Oleh: {ticket.user_email || 'Anonim'}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* FAB (Floating Action Button) - Khas Google Material */}
      <Link href="/dashboard">
        <button className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
          <Plus className="w-8 h-8" />
        </button>
      </Link>
    </div>
  );
}