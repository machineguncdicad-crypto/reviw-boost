"use client";

import Image from "next/image"; 
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Mail, Lock, Eye, EyeOff, Loader2, 
  ArrowRight, Rocket, Store 
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // --- 1. FUNGSI BARU: DAFTAR PAKE GOOGLE ---
  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      // Gak perlu alert/router push karena otomatis redirect ke Google
    } catch (error: any) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);
    setErrorMsg("");

    if (!email || !password || !brandName) {
        setErrorMsg("Harap isi semua data (Nama Toko, Email, Password).");
        setLoading(false);
        return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                brand_name: brandName, 
            },
        },
      });

      if (error) throw error;
      
      alert("🎉 SIAP! Akun berhasil dibuat. Cek email untuk verifikasi!");
      router.push("/login");

    } catch (error: any) {
      setErrorMsg(error.message || "Gagal mendaftar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-950 text-white font-sans selection:bg-amber-500/30">
      
      {/* --- BAGIAN KIRI: VISUAL (DESKTOP) --- */}
      <div className="hidden lg:flex w-1/2 bg-zinc-900 relative items-center justify-center p-12 overflow-hidden">
        {/* Efek Background Emas */}
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 max-w-md">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-700 bg-zinc-800/50 mb-6">
              {/* 👇 ICON JADI EMAS */}
              <Rocket size={14} className="fill-amber-500 text-amber-500" /> 
              <span className="text-xs font-bold tracking-wide text-zinc-300">MULAI GRATIS SEKARANG</span>
           </div>
           <h1 className="text-4xl font-black mb-6 leading-tight">
              Siap Meledakkan <br/>
              {/* 👇 GRADIENT TEXT JADI EMAS */}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Omzet Bisnismu?</span>
           </h1>
           <p className="text-zinc-400 mb-8 leading-relaxed">
           Bergabunglah dengan pebisnis cerdas yang mengambil kendali penuh atas reputasi digital mereka.
           </p>
           
           {/* Mini Stats */}
           <div className="flex gap-8 border-t border-zinc-800 pt-8">
              <div>
                 
              </div>
           </div>
        </div>
      </div>

      {/* --- BAGIAN KANAN: FORM REGISTER --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md space-y-8">
            
            {/* Header + LOGO */}
            <div className="text-center lg:text-left">
                <div className="flex justify-center lg:justify-start mb-8">
                    <Image
                      src="/reviewboost.png" 
                      alt="Logo ReviewBoost"
                      width={160}
                      height={50}
                      className="object-contain"
                      priority
                    />
                </div>
                <h2 className="text-3xl font-bold">Buat Akun Baru</h2>
                <p className="text-zinc-500 mt-2">Daftar dalam 30 detik. Gratis tanpa kartu kredit.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
                
                {/* Input Nama Brand */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Nama Brand / Toko</label>
                    <div className="relative">
                        <Store className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                        <input 
                            type="text" 
                            required
                            placeholder="Contoh: Kopi Senja"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            // 👇 RING FOCUS JADI EMAS
                            className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-white placeholder:text-zinc-600"
                        />
                    </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Email Bisnis</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                        <input 
                            type="email" 
                            required
                            placeholder="bos@reviewboost.id"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            // 👇 RING FOCUS JADI EMAS
                            className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-white placeholder:text-zinc-600"
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Buat Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required
                            placeholder="Minimal 6 karakter"
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            // 👇 RING FOCUS JADI EMAS
                            className="w-full pl-10 pr-12 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-white placeholder:text-zinc-600"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-zinc-500 hover:text-white transition"
                        >
                            {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                    </div>
                </div>

                {/* Error Alert */}
                {errorMsg && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center animate-in fade-in">
                        {errorMsg}
                    </div>
                )}

                {/* Submit Button (JADI GRADIENT EMAS BIAR MENTERENG) */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold rounded-xl transition shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={20}/> : "Daftar Sekarang"}
                    {!loading && <ArrowRight size={18}/>}
                </button>
            </form>

            {/* --- 2. DIVIDER & GOOGLE BUTTON (DITAMBAHIN DISINI) --- */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-800"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-zinc-950 px-2 text-zinc-500">Atau daftar dengan</span>
                </div>
            </div>

            <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white text-zinc-900 font-semibold py-3.5 px-4 rounded-xl hover:bg-zinc-200 transition duration-200"
            >
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
                Google
            </button>
            {/* ----------------------------------------------------- */}

            <div className="text-center pt-2">
                <p className="text-zinc-500 text-sm">
                    Sudah punya akun?{" "}
                    {/* 👇 LINK HOVER JADI EMAS */}
                    <Link href="/login" className="text-white font-bold hover:underline decoration-amber-500 underline-offset-4">
                        Login Disini
                    </Link>
                </p>
            </div>

        </div>
      </div>
    </div>
  );
}