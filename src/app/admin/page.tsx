"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Semua Data
  async function fetchTickets() {
    setLoading(true);
    const { data } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setTickets(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchTickets();
  }, []);

  // 2. Logic Update Status
  async function updateStatus(id: string, newStatus: string) {
    // Update di Database
    const { error } = await supabase
      .from("tickets")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      // Update tampilan di layar tanpa refresh
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
      alert(`Status berhasil diubah jadi ${newStatus}`);
    } else {
      alert("Gagal update status");
    }
  }

  // Hitung Statistik Sederhana
  const total = tickets.length;
  const pending = tickets.filter(t => t.status === 'PENDING').length;
  const selesai = tickets.filter(t => t.status === 'SELESAI').length;

  return (
    <div className="min-h-screen bg-background font-sans text-text">
      
      {/* === NAVBAR ADMIN === */}
      <nav className="bg-primary px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-white font-bold text-xl flex items-center gap-2">
          <div className="bg-white text-primary w-8 h-8 rounded-md flex items-center justify-center">A</div>
          Admin Dashboard
        </h1>
        <div className="flex gap-4">
            <Link href="/" className="text-white opacity-80 hover:opacity-100 text-sm">Lihat Web Utama</Link>
            <Button variant="destructive" size="sm" className="rounded-full">Keluar</Button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* === STATS CARDS === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 rounded-lg border-none shadow-sm flex items-center gap-4 bg-surface">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-primary">
                    <AlertCircle />
                </div>
                <div>
                    <p className="text-sm text-gray-500 ">Total Laporan</p>
                    <h2 className="text-3xl font-bold">{total}</h2>
                </div>
            </Card>

            <Card className="p-6 rounded-lg border-none shadow-sm flex items-center gap-4 bg-surface">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                    <Clock />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Perlu Proses</p>
                    <h2 className="text-3xl font-bold">{pending}</h2>
                </div>
            </Card>

            <Card className="p-6 rounded-lg border-none shadow-sm flex items-center gap-4 bg-surface">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-accent">
                    <CheckCircle />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Selesai</p>
                    <h2 className="text-3xl font-bold">{selesai}</h2>
                </div>
            </Card>
        </div>

        {/* === TABEL MANAGEMENT === */}
        <Card className="rounded-lg shadow-sm border-none bg-surface overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
                <h2 className="font-bold text-lg">Daftar Laporan Masuk</h2>
                <Button variant="outline" size="sm" onClick={fetchTickets} className="rounded-full">
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 font-medium">Tanggal</th>
                            <th className="px-6 py-4 font-medium">Pelapor</th>
                            <th className="px-6 py-4 font-medium">Masalah</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr><td colSpan={5} className="p-6 text-center text-gray-500">Loading data...</td></tr>
                        ) : tickets.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(t.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 font-medium text-primary">
                                    {t.user_email || "Anonim"}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium">{t.title}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{t.description}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge className={`rounded-full font-normal ${
                                        t.status === 'SELESAI' ? 'bg-accent hover:bg-green-600' : 
                                        t.status === 'PROSES' ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : 
                                        'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                    }`}>
                                        {t.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {/* Dropdown Native biar enteng */}
                                    <select 
                                        className="bg-white border border-border rounded-md text-xs py-1 px-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={t.status}
                                        onChange={(e) => updateStatus(t.id, e.target.value)}
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="PROSES">Proses</option>
                                        <option value="SELESAI">Selesai</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
      </main>
    </div>
  );
}