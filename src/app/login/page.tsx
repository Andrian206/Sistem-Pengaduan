"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    // Coba Login
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      // Kalau gagal login, coba Register otomatis (Cheat biar cepet)
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        alert(error.message);
      } else {
        alert("Akun baru dibuat! Silakan login.");
      }
    } else {
      // Login Sukses -> Lempar ke Dashboard
      router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-lg border-none bg-surface">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4">L</div>
          <h1 className="text-2xl font-bold text-text">Selamat Datang</h1>
          <p className="text-gray-500">Masuk untuk mulai melapor masalah</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 ml-1">Email</label>
            <Input 
              type="email" 
              placeholder="nama@email.com" 
              className="rounded-xl h-12 bg-gray-50 border-transparent focus:bg-white focus:border-primary transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
            <Input 
              type="password" 
              placeholder="******" 
              className="rounded-xl h-12 bg-gray-50 border-transparent focus:bg-white focus:border-primary transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button 
            className="w-full h-12 text-lg rounded-full font-bold bg-primary hover:bg-blue-700 shadow-md hover:shadow-lg transition-all" 
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk / Daftar"}
          </Button>

          <div className="text-center mt-4">
             <Link href="/" className="text-sm text-primary hover:underline">Kembali ke Halaman Utama</Link>
          </div>
        </div>
      </Card>
    </div>
  );
}