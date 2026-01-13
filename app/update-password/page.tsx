"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // 👈 KITA PAKE INI AJA (SAMA KAYAK LOGIN)
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Cek apakah ada session (dari link email)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Kalau user iseng buka halaman ini tanpa klik link email, tendang ke login
        // router.push("/login"); 
      }
    };
    checkSession();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // 🔥 LOGIC GANTI PASSWORD
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setMessage("❌ Gagal: " + error.message);
    } else {
      setMessage("✅ Password Berhasil Diubah! Mengalihkan...");
      setTimeout(() => {
        router.push("/dashboard"); 
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Buat Password Baru</h2>
        <p className="text-zinc-500 text-sm mb-6">Jangan pakai password yang sama dengan sebelumnya.</p>
        
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="relative">
             <Lock className="absolute left-3 top-3.5 text-zinc-500" size={18} />
             <input
                type={showPassword ? "text" : "password"}
                placeholder="Password Baru"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-white"
                required
             />
             <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-zinc-500 hover:text-white transition"
             >
                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
             </button>
          </div>

          {message && (
             <div className={`p-3 rounded-lg text-sm font-medium text-center ${message.includes("✅") ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                {message}
             </div>
          )}

          <button 
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20}/> : "Simpan Password Baru"}
            {!loading && <ArrowRight size={18}/>}
          </button>
        </form>
      </div>
    </div>
  );
}