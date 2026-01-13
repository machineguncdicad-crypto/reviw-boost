"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, MousePointer2, TrendingUp, Star, 
  MapPin, Globe, Loader2, ThumbsUp, ThumbsDown, 
  MessageCircle, Sparkles, Zap, BrainCircuit
} from "lucide-react";
import Link from "next/link";

export default function AnalyticsDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({
    avgRating: 0,
    totalReviews: 0,
    happyCount: 0,
    sadCount: 0,
    starCounts: [0, 0, 0, 0, 0]
  });
  
  // State untuk "AI" Insight
  const [aiInsight, setAiInsight] = useState({
      title: "Menganalisa data...",
      message: "Sedang memproses feedback pelanggan...",
      color: "from-zinc-800 to-zinc-900",
      action: "Tunggu sebentar..."
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        // 1. Ambil Data Toko
        let storeData = null;
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).single();
        if (profile) {
            storeData = profile;
        } else {
            const { data: camp } = await supabase.from("campaigns").select("*").eq("id", id).single();
            if (camp) storeData = { ...camp, business_name: camp.brand_name };
        }

        if (storeData) {
            setStore(storeData);

            // 2. Ambil Review
            const { data: feedbacks } = await supabase
                .from("feedbacks")
                .select("*")
                .eq("campaign_id", id)
                .order("created_at", { ascending: false });

            if (feedbacks) {
                setReviews(feedbacks);

                // 3. Hitung Statistik
                let total = feedbacks.length;
                let sumRating = 0;
                let happy = 0;
                let sad = 0;
                let stars = [0, 0, 0, 0, 0];

                feedbacks.forEach((r: any) => {
                    sumRating += r.rating;
                    if (r.rating >= 4) happy++; else sad++;
                    if (r.rating >= 1 && r.rating <= 5) stars[r.rating - 1]++;
                });

                const avg = total > 0 ? Number((sumRating / total).toFixed(1)) : 0;

                setStats({
                    avgRating: avg,
                    totalReviews: total,
                    happyCount: happy,
                    sadCount: sad,
                    starCounts: stars
                });

                // 4. GENERATE AI INSIGHT (LOGIKA PINTAR) 🧠
                generateSmartInsight(avg, total, happy, sad, storeData.clicks);
            }
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

  // FUNGSI "OTAK" BUAT BIKIN SARAN OTOMATIS
  const generateSmartInsight = (avg: number, total: number, happy: number, sad: number, clicks: number) => {
      let insight = { title: "", message: "", color: "", action: "" };

      if (total === 0) {
          insight = {
              title: "Data Belum Cukup 📊",
              message: "Belum ada review yang masuk. Bagikan QR Code Anda lebih sering kepada pelanggan.",
              color: "from-zinc-800 to-zinc-900",
              action: "Cetak & Tempel QR Code di meja kasir."
          };
      } else if (avg >= 4.5) {
          insight = {
              title: "Performa Luar Biasa! 🚀",
              message: `Rating rata-rata ${avg} menunjukkan pelanggan sangat puas. Sebanyak ${happy} orang memberikan respons positif.`,
              color: "from-green-900/40 to-zinc-900",
              action: "Pertahankan kualitas layanan. Minta pelanggan setia untuk merekomendasikan teman."
          };
      } else if (avg >= 3.5) {
          insight = {
              title: "Cukup Baik, Tapi Waspada ⚠️",
              message: `Anda memiliki ${sad} keluhan yang perlu ditangani. Rating ${avg} masih aman tapi bisa turun jika tidak dijaga.`,
              color: "from-amber-900/40 to-zinc-900",
              action: "Cek detail komplain di Inbox. Balas pesan mereka dan tawarkan solusi."
          };
      } else {
          insight = {
              title: "Perlu Perbaikan Segera 🚨",
              message: `Rating ${avg} tergolong rendah. Banyak pelanggan kecewa. Ini bisa merusak reputasi jangka panjang.`,
              color: "from-red-900/40 to-zinc-900",
              action: "Lakukan evaluasi total layanan/produk. Hubungi pelanggan yang komplain secara personal."
          };
      }
      setAiInsight(insight);
  };

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-amber-500" size={32}/>
        <p className="text-zinc-500 animate-pulse">Sedang menganalisis data...</p>
    </div>
  );

  if (!store) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Data Tidak Ditemukan</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans p-4 md:p-8 relative overflow-x-hidden">
        
        {/* Background Blob */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
            
            {/* HEADER NAV */}
            <div className="mb-8">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition mb-4 text-sm font-bold">
                    <ArrowLeft size={16}/> Kembali ke Dashboard
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">{store.business_name}</h1>
                        <div className="flex gap-4 text-sm text-zinc-400">
                            <span className="flex items-center gap-1"><Globe size={14}/> reviewboost.id/{store.slug}</span>
                        </div>
                    </div>
                    <a href={`/${store.slug}`} target="_blank" className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-zinc-200 transition shadow-lg shadow-white/5">
                        Buka Halaman Toko ↗
                    </a>
                </div>
            </div>

            {/* --- AI INSIGHT SECTION (INI YANG BARU) --- */}
            <div className={`mb-8 p-1 rounded-[2.2rem] bg-gradient-to-r ${aiInsight.title.includes("Luar Biasa") ? "from-green-500/50 to-blue-500/50" : aiInsight.title.includes("Waspada") ? "from-amber-500/50 to-orange-500/50" : aiInsight.title.includes("Perbaikan") ? "from-red-500/50 to-pink-500/50" : "from-zinc-700 to-zinc-800"}`}>
                <div className={`bg-gradient-to-br ${aiInsight.color} backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 p-10 opacity-10"><BrainCircuit size={120} className="text-white"/></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md border border-white/20">
                                <Sparkles size={24} className="text-amber-300 fill-amber-300 animate-pulse"/>
                            </div>
                            <span className="text-sm font-bold uppercase tracking-widest text-white/70">ReviewBoost AI Analysis</span>
                        </div>
                        
                        <h2 className="text-3xl font-black text-white mb-2">{aiInsight.title}</h2>
                        <p className="text-zinc-300 text-lg max-w-2xl leading-relaxed mb-6">{aiInsight.message}</p>
                        
                        <div className="inline-flex items-center gap-3 bg-black/30 px-5 py-3 rounded-xl border border-white/10">
                            <Zap size={18} className="text-amber-400"/>
                            <span className="text-sm font-bold text-amber-100">Saran: {aiInsight.action}</span>
                        </div>
                    </div>
                </div>
            </div>
            {/* ------------------------------------------ */}

            {/* TOP STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2 text-zinc-400 text-sm font-bold uppercase tracking-wider"><TrendingUp size={16}/> Kunjungan</div>
                    <div className="text-3xl font-black text-white">{store.visits || 0}</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2 text-blue-400 text-sm font-bold uppercase tracking-wider"><MousePointer2 size={16}/> Klik Maps</div>
                    <div className="text-3xl font-black text-white">{store.clicks || 0}</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2 text-amber-400 text-sm font-bold uppercase tracking-wider"><Star size={16}/> Rata-Rata</div>
                    <div className="text-3xl font-black text-white">{stats.avgRating} <span className="text-base text-zinc-500 font-normal">/ 5.0</span></div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2 text-green-400 text-sm font-bold uppercase tracking-wider"><MessageCircle size={16}/> Total Ulasan</div>
                    <div className="text-3xl font-black text-white">{stats.totalReviews}</div>
                </div>
            </div>

            {/* DETAIL ANALITIK */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-2 bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2rem]">
                    <h3 className="text-xl font-bold mb-6">Distribusi Rating</h3>
                    <div className="space-y-4">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = stats.starCounts[star - 1];
                            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                            return (
                                <div key={star} className="flex items-center gap-4">
                                    <div className="w-12 text-sm font-bold text-zinc-400 flex items-center gap-1">{star} <Star size={12} className="fill-zinc-400"/></div>
                                    <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden"><div className={`h-full rounded-full ${star >= 4 ? 'bg-amber-400' : 'bg-zinc-600'}`} style={{ width: `${percentage}%` }}></div></div>
                                    <div className="w-10 text-right text-sm text-white font-mono">{count}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2rem] flex flex-col justify-center">
                    <h3 className="text-xl font-bold mb-6 text-center">Sentimen</h3>
                    <div className="flex gap-4 justify-center">
                        <div className="text-center p-4 bg-green-500/10 rounded-2xl border border-green-500/20 flex-1">
                            <ThumbsUp size={24} className="text-green-500 mx-auto mb-2"/>
                            <div className="text-2xl font-black text-white">{stats.happyCount}</div>
                            <div className="text-xs text-green-500 font-bold uppercase">Happy</div>
                        </div>
                        <div className="text-center p-4 bg-red-500/10 rounded-2xl border border-red-500/20 flex-1">
                            <ThumbsDown size={24} className="text-red-500 mx-auto mb-2"/>
                            <div className="text-2xl font-black text-white">{stats.sadCount}</div>
                            <div className="text-xs text-red-500 font-bold uppercase">Kecewa</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* REVIEW TERKIRIM */}
            <div>
                <h3 className="text-xl font-bold mb-6">Review Terkini</h3>
                {reviews.length === 0 ? (
                    <div className="text-center py-10 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl text-zinc-500">Belum ada review untuk toko ini.</div>
                ) : (
                    <div className="grid gap-4">
                        {reviews.slice(0, 5).map((rev) => (
                            <div key={rev.id} className="bg-zinc-900/30 border border-zinc-800 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-start">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${rev.rating >= 4 ? 'bg-green-900/30 text-green-500' : 'bg-red-900/30 text-red-500'}`}>{rev.rating}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-white text-sm">{rev.customer_name || "Anonim"}</h4>
                                        <span className="text-zinc-500 text-xs">• {new Date(rev.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-zinc-300 text-sm">"{rev.comment || "-"}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    </div>
  );
}