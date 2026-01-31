"use client";

import { useState, useEffect } from "react";
import { supabase, canAccessAdminPanel, ROLE_PERMISSIONS, type Ticket, type UserRole } from "@/utils/supabase";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('warga');
  
  const router = useRouter();

  async function fetchTickets() {
    setLoading(true);
    const { data } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setTickets(data as Ticket[]);
    setLoading(false);
  }

  useEffect(() => {
    async function checkAccess() {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) {
         router.push('/login');
         return;
       }
       
       const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

       const role = (profile?.role as UserRole) || 'warga';

       if (!canAccessAdminPanel(role)) {
         router.push('/dashboard');
         return;
       }
       
       setUserRole(role);
       fetchTickets();
       setIsCheckingAuth(false);
    }
    checkAccess();
  }, [router]);

  const permissions = ROLE_PERMISSIONS[userRole];

  async function updateStatus(id: string, newStatus: string) {
    if (!permissions.canUpdateStatus) return;
    
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus as Ticket['status'] } : t)));

    const { error } = await supabase
      .from("tickets")
      .update({ status: newStatus })
      .eq("id", id);
      
    if (error) alert("Gagal update status di server");
  }

  async function deleteTicket(id: string) {
    if (!permissions.canDeleteTicket) return;
    if(!confirm("Yakin ingin menghapus laporan ini?")) return;

    setTickets((prev) => prev.filter((t) => t.id !== id));
    await supabase.from("tickets").delete().eq("id", id);
  }

  // Filter Logic
  const filteredData = tickets.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                        (t.user_email && t.user_email.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === "ALL" ? true : t.status === filter;
    return matchSearch && matchFilter;
  });

  // Loading screen saat cek auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* HEADER ADMIN / KEPALA RT / KETUA RT */}
      <header className={`${userRole === 'rt' ? 'bg-gradient-to-r from-cyan-600 to-cyan-500' : userRole === 'ketua_rt' ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' : 'bg-primary'} text-white sticky top-0 z-30 shadow-lg shadow-blue-900/10`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center font-bold border border-white/20">
                    <span className="material-symbols-outlined text-xl">
                      {userRole === 'rt' ? 'monitoring' : userRole === 'ketua_rt' ? 'verified_user' : 'admin_panel_settings'}
                    </span>
                </div>
                <div>
                    <h1 className="font-bold text-base leading-tight">
                      {permissions.label} SapaIKMP
                    </h1>
                    <p className="text-[10px] text-blue-200 uppercase tracking-wider">
                      {!permissions.canUpdateStatus ? 'Mode Lihat Saja' : !permissions.canDeleteTicket ? 'Mode Update Status' : 'Panel Pengurus'}
                    </p>
                </div>
            </div>
            {/* Badge Role */}
            {!permissions.canDeleteTicket && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
                <span className="material-symbols-outlined text-sm">{permissions.canUpdateStatus ? 'edit' : 'visibility'}</span>
                <span className="text-xs font-semibold">{permissions.canUpdateStatus ? 'Update Only' : 'Read-Only'}</span>
              </div>
            )}
            <button 
                onClick={() => { supabase.auth.signOut(); router.push('/'); }}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 rounded-full transition-all"
            >
                Keluar
            </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
                { label: 'Masuk', count: tickets.filter(t => t.status === 'PENDING').length, color: 'text-warning', bg: 'bg-orange-50', border: 'border-orange-200' },
                { label: 'Proses', count: tickets.filter(t => t.status === 'PROSES').length, color: 'text-primary', bg: 'bg-blue-50', border: 'border-blue-200' },
                { label: 'Selesai', count: tickets.filter(t => t.status === 'SELESAI').length, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
                { label: 'Total', count: tickets.length, color: 'text-slate-600', bg: 'bg-white', border: 'border-slate-200' },
            ].map((stat, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${stat.border} ${stat.bg} shadow-sm`}>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">{stat.label}</p>
                    <h3 className={`text-3xl font-black ${stat.color}`}>{stat.count}</h3>
                </div>
            ))}
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            {/* Filter Tabs */}
            <div className="flex p-1 bg-white rounded-xl border border-slate-200 shadow-sm w-fit overflow-x-auto">
                {['ALL', 'PENDING', 'PROSES', 'SELESAI'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                            filter === f ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        {f === 'ALL' ? 'Semua' : f}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
                <Input 
                    placeholder="Cari Pelapor / Judul..." 
                    className="pl-10 rounded-xl bg-white border-slate-200 w-full md:w-64 focus-visible:ring-primary shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Waktu & Pelapor</th>
                            <th className="px-6 py-4">Masalah</th>
                            <th className="px-6 py-4">Bukti</th>
                            <th className="px-6 py-4">Status</th>
                            {permissions.canDeleteTicket && <th className="px-6 py-4 text-right">Aksi</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                             <tr><td colSpan={permissions.canDeleteTicket ? 5 : 4} className="p-8 text-center text-slate-400">Memuat data...</td></tr>
                        ) : filteredData.length === 0 ? (
                            <tr><td colSpan={permissions.canDeleteTicket ? 5 : 4} className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                                <span className="material-symbols-outlined text-4xl opacity-20">search_off</span>
                                Tidak ada data ditemukan.
                            </td></tr>
                        ) : (
                            filteredData.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 align-top">
                                        <div className="text-xs text-slate-400 mb-1">
                                            {new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {new Date(t.created_at).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                                        </div>
                                        <div className="font-bold text-slate-800">
                                            {t.user_email ? t.user_email : 'Anonim'}
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 align-top max-w-xs">
                                        <div className="font-bold text-slate-800 mb-1">{t.title}</div>
                                        <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>
                                    </td>

                                    <td className="px-6 py-4 align-top">
                                        {t.image_url ? (
                                            <button 
                                                onClick={() => setSelectedImage(t.image_url)}
                                                className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-primary transition-all relative group"
                                            >
                                                <img src={t.image_url} className="w-full h-full object-cover" alt="Proof"/>
                                                <div className="absolute inset-0 bg-black/30 hidden group-hover:flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-white text-sm">visibility</span>
                                                </div>
                                            </button>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Tidak ada</span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 align-top">
                                        {/* Roles with update permission: Dropdown untuk update status */}
                                        {permissions.canUpdateStatus ? (
                                          <div className="relative">
                                              <select 
                                                  className={`
                                                      appearance-none cursor-pointer rounded-full pl-3 pr-8 py-1.5 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-offset-1 transition-all
                                                      ${t.status === 'PENDING' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : ''}
                                                      ${t.status === 'PROSES' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                                                      ${t.status === 'SELESAI' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                                                  `}
                                                  value={t.status}
                                                  onChange={(e) => updateStatus(t.id, e.target.value)}
                                              >
                                                  <option value="PENDING">🕒 Pending</option>
                                                  <option value="PROSES">🛠️ Proses</option>
                                                  <option value="SELESAI">✅ Selesai</option>
                                              </select>
                                              <span className="material-symbols-outlined absolute right-2 top-1.5 text-sm pointer-events-none opacity-50">expand_more</span>
                                          </div>
                                        ) : (
                                          /* Read-only roles: Badge status */
                                          <span className={`
                                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                                            ${t.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : ''}
                                            ${t.status === 'PROSES' ? 'bg-blue-100 text-blue-700' : ''}
                                            ${t.status === 'SELESAI' ? 'bg-green-100 text-green-700' : ''}
                                          `}>
                                            {t.status === 'PENDING' && '🕒'}
                                            {t.status === 'PROSES' && '🛠️'}
                                            {t.status === 'SELESAI' && '✅'}
                                            {t.status}
                                          </span>
                                        )}
                                    </td>

                                    {/* Admin only: Delete button */}
                                    {permissions.canDeleteTicket && (
                                      <td className="px-6 py-4 align-top text-right">
                                          <button 
                                              onClick={() => deleteTicket(t.id)}
                                              className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
                                              title="Hapus Laporan"
                                          >
                                              <span className="material-symbols-outlined text-lg">delete</span>
                                          </button>
                                      </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </main>

      {/* IMAGE MODAL */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="sm:max-w-2xl bg-transparent border-none shadow-none p-0 flex items-center justify-center">
            {selectedImage && (
                <img 
                    src={selectedImage} 
                    alt="Bukti Full" 
                    className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl"
                />
            )}
        </DialogContent>
      </Dialog>

    </div>
  );
}