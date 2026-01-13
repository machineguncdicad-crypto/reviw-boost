"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Pake settingan supabase lu yang udah ada

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. Supabase otomatis mendeteksi hash (#) di URL dan menukarnya jadi session
    const handleAuth = async () => {
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Login Error:", error.message);
        router.push("/login?error=auth_failed");
      } else {
        // 2. Kalau sukses, lempar ke halaman utama / dashboard
        // Ganti "/dashboard" dengan halaman tujuan lu (misal "/" untuk home)
        router.push("/dashboard"); 
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
      <div className="flex flex-col items-center gap-4">
        {/* Loading Spinner biar cantik */}
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 animate-pulse">Sedang memverifikasi Google...</p>
      </div>
    </div>
  );
}