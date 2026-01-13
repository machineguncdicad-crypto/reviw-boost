"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase"; // 👈 KITA PAKE INI AJA YANG UDAH ADA
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, KeyRound } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    if (!email.trim()) {
        setMessage("Email harus diisi dulu dong.");
        setMessageType("error");
        setLoading(false);
        return;
    }

    try {
      // URL tujuan setelah klik link di email
      // Nanti user bakal dilempar ke halaman update-password
      const redirectUrl = `${window.location.origin}/update-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        throw error;
      }

      setMessage(`✅ Link reset udah dikirim ke ${email}. Cek inbox/spam ya!`);
      setMessageType("success");
      setEmail(""); // Kosongin form kalau sukses

    } catch (error: any) {
      setMessage("❌ Gagal ngirim: " + (error.message || "Terjadi kesalahan."));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 selection:bg-amber-500/30">
      {/* Background effect tipis-tipis */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl relative z-10">
        
        {/* Header & Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800/50 mb-4 border border-zinc-700">
             <KeyRound className="text-amber-500" size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white">Lupa Password?</h2>
          <p className="text-zinc-400 text-sm mt-2">
            Santai, masukin email lu di bawah, nanti kita kirim "kunci cadangan".
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Email yang terdaftar</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                <input
                  type="email"
                  placeholder="nama@bisnis.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-white placeholder:text-zinc-600"
                  required
                />
              </div>
          </div>

          {/* Pesan Sukses/Error */}
          {message && (
             <div className={`p-4 rounded-xl text-sm font-medium flex items-start gap-2 animate-in fade-in ${
                messageType === "success" 
                  ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
             }`}>
                {message}
             </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold rounded-xl transition shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20}/> : "Kirim Link Reset"}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-8 text-center">
           <Link 
             href="/login" 
             className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-500 transition group"
           >
             <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/>
             Kembali ke Login
           </Link>
        </div>

      </div>
    </div>
  );
}