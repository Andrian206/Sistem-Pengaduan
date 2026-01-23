"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, LogOut, User } from "lucide-react";

export default function UserDashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false); // Untuk Dialog
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const router = useRouter();

  // 1. Cek User Login & Fetch Data
  useEffect(() => {
    async function init() {
      // Cek sesi
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login"); // Tendang kalau belum login
        return;
      }
      setUser(user);

      // Ambil tiket milik user ini saja
      const { data } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (data) setTickets(data);
    }
    init();
  }, [router]);

  // 2. Logic Kirim Laporan Baru
  async function submitTicket() {
    if (!title || !desc) return alert("Isi semua dulu!");

    const { error } = await supabase.from("tickets").insert({
      title: title,
      description: desc,
      user_id: user.id,
      user_email: user.email,
      status: "PENDING"
    });

    if (!error) {
      alert("Laporan terkirim!");
      setOpen(false); // Tutup dialog
      window.location.reload(); // Refresh halaman biar muncul (cara cepat)
    } else {
      alert("Gagal kirim: " + error.message);
    }
  }

  // 3. Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background font-sans text-text pb-20">
      
      {/* NAVBAR USER */}
      <nav className="bg-surface px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <div className="font-bold text-primary text-xl tracking-tight">LaporAja Dashboard</div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            <User size={16} /> {user?.email}
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:bg-red-50 rounded-full">
            <LogOut size={18} />
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 mt-8">
        <h1 className="text-3xl font-bold mb-6">Laporan Saya</h1>

        {tickets.length === 0 ? (
            // Kosong State
            <div className="text-center py-20 bg-surface rounded-2xl shadow-sm">
                <p className="text-gray-400 mb-4">Belum ada laporan yang kamu buat.</p>
                <Button onClick={() => setOpen(true)} className="rounded-full bg-primary">Buat Laporan Pertama</Button>
            </div>
        ) : (
            // Grid Laporan
            <div className="grid gap-4">
                {tickets.map((t) => (
                    <Card key={t.id} className="p-5 rounded-xl border-none shadow-sm hover:shadow-md transition-all bg-surface flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-bold text-lg text-primary">{t.title}</h3>
                                <Badge className={`rounded-full px-2 text-[10px] ${
                                    t.status === 'SELESAI' ? 'bg-accent' : 
                                    t.status === 'PROSES' ? 'bg-yellow-400 text-black' : 'bg-gray-200 text-gray-700'
                                }`}>
                                    {t.status}
                                </Badge>
                            </div>
                            <p className="text-gray-600 text-sm">{t.description}</p>
                            <p className="text-xs text-gray-400 mt-2">{new Date(t.created_at).toLocaleDateString()}</p>
                        </div>
                    </Card>
                ))}
            </div>
        )}
      </main>

      {/* FAB + DIALOG FORM */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <button className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-20">
                <Plus className="w-8 h-8" />
            </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md rounded-2xl bg-surface border-none p-6">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-primary">Buat Laporan Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
                <div>
                    <label className="text-sm font-medium ml-1">Judul Masalah</label>
                    <Input 
                        placeholder="Contoh: AC Ruang 301 Panas" 
                        className="rounded-xl mt-1 bg-gray-50 border-none"
                        value={title} onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium ml-1">Deskripsi Detail</label>
                    <Textarea 
                        placeholder="Jelaskan kronologi atau detail masalahnya..." 
                        className="rounded-xl mt-1 bg-gray-50 border-none h-32"
                        value={desc} onChange={(e) => setDesc(e.target.value)}
                    />
                </div>
                <Button onClick={submitTicket} className="w-full rounded-full bg-primary h-12 text-lg font-bold mt-2 hover:bg-blue-700">
                    Kirim Laporan
                </Button>
            </div>
        </DialogContent>
      </Dialog>
      
    </div>
  );
}