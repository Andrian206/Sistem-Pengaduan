"use client";

import { useState } from "react";
import { useAuthSecure } from "@/hooks/useAuthSecure";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { register } = useAuthSecure();
  const toast = useToast();
  
  // State Form Data
  const [formData, setFormData] = useState({
    fullName: "",
    blok: "",
    phone: "",
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    // 1. Validasi Sederhana
    if (!formData.fullName || !formData.blok || !formData.email || !formData.password) {
      toast.warning("Mohon lengkapi semua data wajib!");
      return;
    }

    if (formData.password.length < 6) {
      toast.warning("Password minimal 6 karakter!");
      return;
    }

    setLoading(true);

    const result = await register(formData.email, formData.password, {
      full_name: formData.fullName,
      blok_rumah: formData.blok,
      phone: formData.phone
    });

    if (!result.success) {
      toast.error(result.error || "Gagal mendaftar. Silakan coba lagi.");
      setLoading(false);
      return;
    }

    toast.success("Registrasi berhasil! Mengalihkan...");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4 font-sans text-foreground">
      
      <Card className="w-full max-w-lg overflow-hidden border-none shadow-xl rounded-2xl bg-surface">
        {/* Header Biru SapaIKMP */}
        <div className="bg-primary p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-1">Pendaftaran Warga</h1>
            <p className="text-blue-100 text-sm">Bergabung dengan SapaIKMP untuk lingkungan yang lebih baik.</p>
            <span className="inline-block mt-2 text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
              🔒 Secure Mode
            </span>
        </div>

        <div className="p-8 space-y-5">
            {/* Form Input */}
            <div className="space-y-4">
                
                {/* Nama Lengkap */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Nama Lengkap (Sesuai KTP)</label>
                    <Input 
                        name="fullName"
                        placeholder="Contoh: Budi Santoso" 
                        className="mt-1 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-primary rounded-xl"
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Blok Rumah */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Blok / No. Rumah</label>
                        <Input 
                            name="blok"
                            placeholder="A5 / 12" 
                            className="mt-1 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-primary rounded-xl"
                            onChange={handleChange}
                        />
                    </div>
                    {/* No HP (Opsional) */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">No. WhatsApp</label>
                        <Input 
                            name="phone"
                            placeholder="0812..." 
                            type="tel"
                            className="mt-1 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-primary rounded-xl"
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-2"></div>

                {/* Akun Login */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Email Aktif</label>
                    <Input 
                        name="email"
                        type="email"
                        placeholder="email@anda.com" 
                        className="mt-1 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-primary rounded-xl"
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Password</label>
                    <Input 
                        name="password"
                        type="password"
                        placeholder="Minimal 6 karakter" 
                        className="mt-1 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-primary rounded-xl"
                        onChange={handleChange}
                    />
                    <p className="text-[10px] text-gray-400 mt-1 ml-1">
                      🔒 Password akan di-enkripsi di server
                    </p>
                </div>

            </div>

            {/* Tombol Aksi */}
            <Button 
                onClick={handleRegister} 
                className="w-full h-12 text-lg font-bold rounded-full bg-gradient-to-r from-primary to-blue-600 hover:to-blue-700 shadow-lg shadow-blue-200 transition-all mt-4"
                disabled={loading}
            >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Daftar Sekarang"}
            </Button>

            {/* Link ke Login */}
            <p className="text-center text-sm text-gray-500 pt-4">
                Sudah punya akun?{" "}
                <Link href="/login-secure" className="text-primary font-bold hover:underline">
                    Masuk di sini
                </Link>
            </p>
        </div>
      </Card>
    </div>
  );
}
