"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowRight, Sparkles, Shield, Crown, AlertTriangle } from "lucide-react"; 
import Link from "next/link"; 

export default function CreateStoreFinal() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  
  // STATE BARU: Limit & Kuota
  const [limitReached, setLimitReached] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [maxLimit, setMaxLimit] = useState(1);
  const [tierName, setTierName] = useState("FREE");
  const [checkingLimit, setCheckingLimit] = useState(true);

  const [formData, setFormData] = useState({
    businessName: "",
    googleMapUrl: ""
  });

  // 1. Cek User & Cek Limit Kuota
  useEffect(() => {
    setIsMounted(true);
    const checkUserAndLimit = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        // A. AMBIL DATA TIER (Level) DARI PROFIL
        // Kita cukup ambil 'tier_name' aja, gak perlu 'limit_campaigns'
        const { data: profile } = await supabase
          .from("profiles")
          .select("tier_name")
          .eq("id", user.id)
          .single();
        
        const tier = profile?.tier_name || "FREE";
        setTierName(tier);

        // 🔥 LOGIKA BARU: TENTUKAN LIMIT BERDASARKAN TIER 🔥
        let calculatedLimit = 1;
        if (tier === 'PRO') calculatedLimit = 3;          // PRO dapet 3
        if (tier === 'ENTERPRISE') calculatedLimit = 999; // Sultan dapet Unlimited

        setMaxLimit(calculatedLimit);

        // B. HITUNG JUMLAH TOKO YANG SUDAH DIBUAT (DI TABEL CAMPAIGNS)
        const { count } = await supabase
          .from("campaigns")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", user.id);

        const existing = count || 0;
        setCurrentCount(existing);

        // C. BANDINGKAN (KALAU SUDAH MENTOK, BLOKIR)
        if (existing >= calculatedLimit) {
            setLimitReached(true);
        }

      } catch (e) {
        console.error(e);
      } finally {
        setCheckingLimit(false);
      }
    };
    checkUserAndLimit();
  }, []);

  // 2. Fungsi Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;
    if (!formData.businessName || !formData.googleMapUrl) {
        alert("Wajib isi Nama Bisnis & Link Google Maps!");
        return;
    }

    setLoading(true);

    try {
      // Auto-Generate Slug
      const autoSlug = formData.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') 
        .replace(/(^-|-$)+/g, '') + 
        "-" + Math.floor(Math.random() * 1000); 

      // Simpan ke Tabel CAMPAIGNS
      const { error } = await supabase
        .from("campaigns")
        .insert({
          user_id: userId,
          brand_name: formData.businessName,
          slug: autoSlug,
          google_map_url: formData.googleMapUrl,
          status: 'active'
        });

      if (error) throw error;

      // Sukses -> Masuk Dashboard
      window.location.href = "/dashboard"; 

    } catch (err: any) {
      alert("Gagal: " + err.message);
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  // 🔥 TAMPILAN BLOKIR (KALAU KUOTA HABIS) 🔥
  if (!checkingLimit && limitReached) {
    return (
        <div className="min-h-screen w-full bg-black text-white font-sans flex items-center justify-center relative overflow-hidden px-4">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-[-20%] left-0 right-0 mx-auto w-[500px] h-[500px] bg-red-900/20 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-lg relative z-10 text-center animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse">
                    <Shield size={40} className="text-red-500"/>
                </div>
                
                <h1 className="text-3xl font-extrabold mb-2 text-white">Kuota Toko Habis</h1>
                <p className="text-zinc-400 mb-8 max-w-sm mx-auto leading-relaxed">
                    Paket <strong className="text-white">{tierName}</strong> hanya mengizinkan <strong>{maxLimit} Toko</strong>. 
                    Saat ini Anda sudah memiliki {currentCount} toko.
                </p>

                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl mb-8 backdrop-blur-sm">
                    <h3 className="font-bold text-white mb-4 flex items-center justify-center gap-2">
                        <Crown size={18} className="text-amber-500"/> Solusi: Upgrade Paket
                    </h3>
                    <div className="space-y-3 text-sm text-zinc-400 text-left px-4">
                        <div className="flex justify-between border-b border-zinc-800 pb-2"><span>Paket BASIC</span> <span className="text-white font-bold">1 Toko</span></div>
                        <div className="flex justify-between border-b border-zinc-800 pb-2"><span>Paket PRO</span> <span className="text-amber-500 font-bold">3 Toko</span></div>
                        <div className="flex justify-between pt-1"><span>Paket ENTERPRISE</span> <span className="text-purple-500 font-bold">UNLIMITED 👑</span></div>
                    </div>
                </div>

                <div className="flex gap-4 justify-center">
                    <Link href="/dashboard" className="px-6 py-3 rounded-xl font-bold text-zinc-500 hover:text-white transition">Kembali</Link>
                    <Link href="/dashboard/profile" className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition shadow-lg shadow-amber-500/20 flex items-center gap-2">
                       <Sparkles size={16}/> Upgrade Sekarang
                    </Link>
                </div>
            </div>
        </div>
    );
  }

  // 🔥 TAMPILAN FORM (NORMAL) 🔥
  return (
    <div className="min-h-screen w-full bg-black text-white font-sans flex items-center justify-center relative overflow-hidden">
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-[-20%] left-0 right-0 mx-auto w-[500px] h-[500px] bg-amber-500/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700 ease-out px-4">
            
            <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold uppercase tracking-widest text-amber-500 mb-6 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <Sparkles size={12} />
                    Premium Setup
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
                    Create Your Store
                </h1>
                <p className="text-zinc-500">
                    Mulai kumpulkan reputasi bintang 5 sekarang.
                </p>
                <p className="text-[10px] text-zinc-600 mt-2 font-mono">
                   Kuota Tersedia: <span className="text-green-500 font-bold">{currentCount} / {maxLimit}</span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                        Nama Bisnis
                    </label>
                    <input
                        required
                        type="text"
                        placeholder="Contoh: Kopi Senja Luxury"
                        value={formData.businessName}
                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                        className="w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-zinc-700"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                            Link Google Maps
                        </label>
                        <span className="text-[9px] bg-amber-500 text-black px-2 py-0.5 rounded font-bold">REQUIRED</span>
                    </div>
                    <input
                        required
                        type="url"
                        placeholder="https://goo.gl/maps/..."
                        value={formData.googleMapUrl}
                        onChange={(e) => setFormData({...formData, googleMapUrl: e.target.value})}
                        className="w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-zinc-700"
                    />
                </div>

                <div className="h-px w-full bg-zinc-800 my-6"></div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        background: 'linear-gradient(to right, #fbbf24, #d97706)',
                        color: 'black',
                        fontWeight: 'bold'
                    }}
                    className="w-full py-4 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={20}/>
                    ) : (
                        <>
                            <span>LAUNCH DASHBOARD</span>
                            <ArrowRight size={20}/>
                        </>
                    )}
                </button>

                <p className="text-center text-[10px] text-zinc-600 mt-6">
                    Protected by ReviewBoost Security Systems.
                </p>

            </form>
        </div>
    </div>
  );
}