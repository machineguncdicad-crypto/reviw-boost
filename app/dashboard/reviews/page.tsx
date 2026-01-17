"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Star, Search, Filter, Loader2, MessageSquare, 
  Store, MapPin, Calendar, Smartphone, Download, 
  Lock
} from "lucide-react";
import Link from "next/link"; 
import { useRouter } from "next/navigation";

export default function ReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [storeNames, setStoreNames] = useState<Record<string, string>>({});
  
  // 🔥 STATUS PRO
  const [isPro, setIsPro] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 🔥 1. CEK STATUS SUBSCRIPTION 🔥
        const { data: profileData } = await supabase
            .from("profiles")
            .select("id, business_name, subscription_status, tier_name") 
            .eq("id", user.id)
            .single();

        // LOGIKA PENENTUAN PRO (LEBIH LONGGAR)
        // Kita cek tier_name juga biar aman
        if (profileData && (
            profileData.subscription_status === 'pro' || 
            profileData.subscription_status === 'lifetime' ||
            profileData.subscription_status === 'active' || // Tambahan buat webhook baru
            (profileData.tier_name && profileData.tier_name !== 'FREE') // Cek Tier
        )) {
             setIsPro(true);
        } else {
             setIsPro(false);
        }

        // --- Ambil Data Toko & Review ---
        const { data: campaigns } = await supabase.from("campaigns").select("id, brand_name").eq("user_id", user.id);

        const sourceMap: Record<string, string> = {};
        const allIds: string[] = [];

        if (profileData) {
            sourceMap[profileData.id] = "🏢 Pusat (" + profileData.business_name + ")";
            allIds.push(profileData.id);
        }

        if (campaigns && campaigns.length > 0) {
            campaigns.forEach((camp: any) => {
                sourceMap[camp.id] = "📍 " + camp.brand_name;
                allIds.push(camp.id);
            });
        }
        setStoreNames(sourceMap);

        if (allIds.length > 0) {
            const { data: feedbacks } = await supabase.from("feedbacks").select("*").in("campaign_id", allIds).order("created_at", { ascending: false });
            if (feedbacks) setReviews(feedbacks);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // --- HANDLE LOCKED ACTION ---
  // Kalau belum PRO, arahkan ke halaman langganan
  const handleLockedAction = (e?: any) => {
      if (!isPro) {
          if (e) e.preventDefault();
          router.push("/dashboard/profile?tab=billing"); // Arahin langsung ke tab billing biar to the point
          return true; 
      }
      return false; 
  };

  // --- EXPORT DATA ---
  const handleExportCSV = () => {
    if (handleLockedAction()) return;

    setIsExporting(true);
    try {
        const headers = ["Nama Pelanggan", "Nomor WA", "Rating", "Komentar", "Tanggal Review", "Asal Toko"];
        const rows = filteredReviews.map(r => {
            const cleanComment = r.comment ? r.comment.replace(/"/g, '""').replace(/;/g, ',') : ""; 
            const source = storeNames[r.campaign_id] || "Unknown";
            const date = new Date(r.created_at).toLocaleDateString("id-ID");
            const phone = r.customer_phone ? `'${r.customer_phone}` : '-'; 
            return `"${r.customer_name || 'Anonim'}";"${phone}";"${r.rating}";"${cleanComment}";"${date}";"${source}"`;
        });
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(";"), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Data_Pelanggan_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error("Gagal export:", e);
        alert("Gagal download data.");
    } finally {
        setIsExporting(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesRating = filterRating === "all" ? true : review.rating === parseInt(filterRating);
    const searchLower = searchQuery.toLowerCase();
    const commentMatch = review.comment ? review.comment.toLowerCase().includes(searchLower) : false;
    const nameMatch = review.customer_name ? review.customer_name.toLowerCase().includes(searchLower) : false;
    return matchesRating && (commentMatch || nameMatch);
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black text-zinc-500"><Loader2 className="animate-spin" size={32}/></div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white p-6 md:p-10 font-sans relative">
      
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                Inbox Review
                {isPro && <span className="text-xs bg-amber-500 text-black px-2 py-1 rounded-md font-bold">PRO</span>}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">Database pelanggan & feedback kamu.</p>
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={handleExportCSV}
                disabled={isExporting || (filteredReviews.length === 0 && isPro)} 
                className={`flex items-center gap-2 font-bold px-5 py-3 rounded-xl transition active:scale-95 border ${!isPro ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed border-zinc-300' : 'bg-zinc-900 dark:bg-zinc-800 text-white hover:bg-zinc-700 border-zinc-700'}`}
            >
                {isExporting ? <Loader2 size={20} className="animate-spin"/> : !isPro ? <Lock size={20}/> : <Download size={20}/>}
                Export CSV
            </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto relative">
        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 text-zinc-400" size={18}/>
                <input type="text" placeholder="Cari nama, nomor HP, atau isi review..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500"/>
            </div>
            <div className="relative">
                <Filter className="absolute left-3 top-3.5 text-zinc-400" size={18}/>
                <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)} className="pl-10 pr-8 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer">
                    <option value="all">Semua Bintang</option>
                    {[5,4,3,2,1].map(r => <option key={r} value={r}>⭐ {r}</option>)}
                </select>
            </div>
        </div>

        {/* --- AREA REVIEW (LOGIKA GEMBOK DIPERBAIKI) --- */}
        <div className="relative min-h-[500px]"> 
            
            {/* 🔥 LAYAR PELINDUNG (CUMA MUNCUL KALO BUKAN PRO) 🔥 */}
            {!isPro && reviews.length > 0 && (
                <div className="absolute inset-0 z-50 backdrop-blur-md bg-white/40 dark:bg-black/40 flex flex-col items-center justify-center rounded-3xl border border-white/10">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-2xl text-center max-w-md mx-4 transform scale-100 transition-transform">
                        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500 animate-bounce">
                            <Lock size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Review Terkunci 🔒</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                            Upgrade ke PRO untuk melihat komentar, membalas pelanggan, dan export data.
                        </p>
                        
                        <button 
                            onClick={() => router.push("/dashboard/profile?tab=billing")} 
                            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3.5 rounded-xl transition transform hover:scale-105 shadow-lg shadow-amber-500/20"
                        >
                            Buka Akses Review ↗
                        </button>

                    </div>
                </div>
            )}

            {/* 🔥 LIST REVIEW (KALO PRO, BLUR-NYA HILANG) 🔥 */}
            <div className={`space-y-4 transition-all duration-500 ${!isPro ? "blur-md opacity-40 grayscale pointer-events-none select-none overflow-hidden h-[600px]" : ""}`}>
                {filteredReviews.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 border-dashed">
                        <MessageSquare className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" size={48}/>
                        <h3 className="text-lg font-bold text-zinc-500">Belum ada review yang cocok</h3>
                        <p className="text-sm text-zinc-400">Coba ganti filter atau tunggu pelanggan ngisi ya.</p>
                    </div>
                ) : (
                    filteredReviews.map((review) => {
                        const sourceName = storeNames[review.campaign_id] || "❓ Toko Tidak Dikenal";
                        const isPusat = sourceName.includes("Pusat");
                        const dateString = new Date(review.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });

                        return (
                            <div key={review.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shrink-0 ${review.rating >= 4 ? "bg-green-500" : "bg-amber-500"}`}>{review.customer_name ? review.customer_name[0].toUpperCase() : "A"}</div>
                                        <div>
                                            <h3 className="font-bold text-lg">{review.customer_name || "Anonim"}</h3>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                                                <span className="flex items-center gap-1"><Calendar size={12}/> {dateString}</span>
                                                <span className={`px-2 py-0.5 rounded-md font-bold border flex items-center gap-1 ${isPusat ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"}`}>
                                                    {isPusat ? <Store size={10}/> : <MapPin size={10}/>} {sourceName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                                        {[1, 2, 3, 4, 5].map((star) => (<Star key={star} size={16} className={`${star <= review.rating ? "text-amber-400 fill-amber-400" : "text-zinc-300 dark:text-zinc-700"}`}/>))}
                                        <span className="ml-1 font-bold text-sm">{review.rating}.0</span>
                                    </div>
                                </div>
                                <div className="pl-0 md:pl-16">
                                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-black/30 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50 italic">"{review.comment || "Tidak ada komentar tertulis."}"</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
      </div>
    </div>
  );
}