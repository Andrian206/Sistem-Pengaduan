"use client";

import { useState, useEffect, ChangeEvent, useCallback } from "react";
import { supabase, type Ticket } from "@/utils/supabase";
import { useAuthSecure } from "@/hooks/useAuthSecure";
import { useToast } from "@/hooks/useToast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function UserDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [open, setOpen] = useState(false);
  
  // Form States
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Toast notifications
  const toast = useToast();
  
  // Menggunakan useAuth hook - semua logic auth ditangani di sini
  const { user, token, isLoading: isCheckingAuth, logout } = useAuthSecure({
    requireAuth: true,           // Redirect ke login jika tidak authenticated
    redirectAdminToPanel: true,  // Admin/RT/Ketua RT redirect ke /admin
  });

  // Fetch tickets saat user tersedia
  useEffect(() => {
    async function fetchTickets() {
      if (!user) return;
      
      const { data } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (data) setTickets(data as Ticket[]);
    }
    
    fetchTickets();
  }, [user]);

  // Cleanup image preview URL to prevent memory leak
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handle Select Image
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 2. Logic Kirim Laporan
  async function submitTicket() {
    if (!user || !token) {
      toast.error("Session tidak valid. Silakan login kembali.");
      return;
    }
    if (!title || !desc) {
      toast.warning("Mohon isi judul dan deskripsi!");
      return;
    }
    setLoading(true);

    try {
      let imageUrl = null;

      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('attachments') // Pastikan bucket 'attachments' ada di Supabase Storage
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrlData.publicUrl;
      }

      // Menggunakan RPC function create_ticket (lebih aman, melalui RLS)
      const { data, error } = await supabase.rpc('create_ticket', {
        p_token: token,
        p_title: title,
        p_description: desc,
        p_image_url: imageUrl
      });

      if (error) throw error;
      
      // Check response dari function
      const result = data as { success: boolean; error?: string; ticket_id?: string };
      if (!result.success) {
        throw new Error(result.error || 'Gagal membuat laporan');
      }

      // Refresh tickets tanpa reload halaman
      const { data: newTickets } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (newTickets) setTickets(newTickets as Ticket[]);
      
      // Reset form
      setTitle("");
      setDesc("");
      setImage(null);
      setImagePreview(null);
      setOpen(false);
      
      toast.success("Laporan berhasil dikirim!");

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error("Gagal mengirim laporan: " + errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Loading screen saat cek auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen pb-20 font-sans">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-lg text-white shadow-md shadow-blue-200">
              <span className="material-symbols-outlined text-xl">home_pin</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-primary hidden sm:block">SapaIKMP</h2>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={logout} className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors">
                Keluar
             </button>
             <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white shadow-sm">
               {user?.email?.[0].toUpperCase() || "W"}
             </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Laporan Saya</h1>
            <div className="bg-white px-4 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-500 shadow-sm">
                Total: {tickets.length}
            </div>
        </div>

        <div className="flex flex-col gap-4">
            {tickets.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">inbox</span>
                    <p className="text-slate-500 font-medium">Belum ada laporan.</p>
                </div>
            ) : (
                tickets.map((t) => (
                    <div key={t.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                t.status === 'SELESAI' ? 'bg-success/10 text-green-700' : 
                                t.status === 'PROSES' ? 'bg-primary/10 text-primary' : 
                                'bg-warning/10 text-warning'
                            }`}>
                                {t.status}
                            </span>
                            <span className="text-xs text-slate-400">
                                {new Date(t.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                        
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">{t.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                                    {t.description}
                                </p>
                            </div>
                            {t.image_url && (
                                <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                                    <img src={t.image_url} alt="Proof" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
      </main>

      {/* FAB + DIALOG FORM (FIXED SCROLL) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <button className="fixed bottom-6 right-6 w-14 h-14 bg-warning text-white rounded-2xl flex items-center justify-center shadow-lg shadow-warning/30 hover:scale-105 active:scale-95 transition-all z-40">
                <span className="material-symbols-outlined text-3xl">add</span>
            </button>
        </DialogTrigger>
        
        {/* === PERBAIKAN SCROLL DI SINI === */}
        <DialogContent className="sm:max-w-[425px] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-white rounded-2xl">
            
            {/* Header Sticky */}
            <DialogHeader className="p-5 border-b border-slate-100 bg-white z-10">
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">edit_square</span>
                    Buat Laporan
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Form untuk membuat laporan pengaduan baru
                </DialogDescription>
            </DialogHeader>
            
            {/* Content Scrollable */}
            <div className="p-5 overflow-y-auto flex-1">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Judul</label>
                        <Input 
                            placeholder="Contoh: Lampu Jalan Mati" 
                            className="rounded-xl bg-slate-50 border-slate-200 h-11 focus-visible:ring-primary"
                            value={title} onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Kronologi</label>
                        <Textarea 
                            placeholder="Jelaskan detail masalah..." 
                            className="rounded-xl bg-slate-50 border-slate-200 min-h-[100px] focus-visible:ring-primary resize-none"
                            value={desc} onChange={(e) => setDesc(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Bukti Foto</label>
                        {!imagePreview ? (
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-primary transition-all group">
                                <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                    <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-primary mb-1">add_a_photo</span>
                                    <p className="text-[10px] text-slate-500">Upload Foto</p>
                                </div>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        ) : (
                            <div className="relative w-full h-40 rounded-xl overflow-hidden group border border-slate-200">
                                <img src={imagePreview} className="w-full h-full object-cover" alt="Preview"/>
                                <button 
                                    onClick={() => { 
                                      if (imagePreview) URL.revokeObjectURL(imagePreview);
                                      setImage(null); 
                                      setImagePreview(null); 
                                    }}
                                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors backdrop-blur-sm"
                                >
                                    <span className="material-symbols-outlined text-base">close</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Sticky */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 z-10">
                <button 
                    onClick={submitTicket} 
                    disabled={loading}
                    className="w-full h-11 bg-primary text-white rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? "Mengirim..." : "Kirim Sekarang"}
                </button>
            </div>

        </DialogContent>
      </Dialog>
    </div>
  );
}