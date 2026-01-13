"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Star, Search, Filter, Loader2, MessageSquare, 
  Store, MapPin, Calendar, Smartphone, Download 
} from "lucide-react";
import Link from "next/link"; 

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [storeNames, setStoreNames] = useState<Record<string, string>>({});
  
  // State buat loading export
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase.from("profiles").select("id, business_name").eq("id", user.id).single();
        const { data: campaigns } = await supabase.from("campaigns").select("id, brand_name").eq("user_id", user.id);

        const sourceMap: Record<string, string> = {};
        const allIds: string[] = [];

        if (profile) {
            sourceMap[profile.id] = "🏢 Pusat (" + profile.business_name + ")";
            allIds.push(profile.id);
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

  // 🔥 FUNGSI BARU: EXPORT DATA (VERSI ANTI-BERANTAKAN) 🔥
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
        // 1. Header Kolom
        const headers = ["Nama Pelanggan", "Nomor WA", "Rating", "Komentar", "Tanggal Review", "Asal Toko"];
        
        // 2. Data Baris (Pake Titik Koma ';' biar Excel Indo seneng)
        const rows = filteredReviews.map(r => {
            // Bersihin tanda kutip & titik koma di dalam teks biar gak error
            const cleanComment = r.comment ? r.comment.replace(/"/g, '""').replace(/;/g, ',') : ""; 
            const source = storeNames[r.campaign_id] || "Unknown";
            const date = new Date(r.created_at).toLocaleDateString("id-ID");
            const phone = r.customer_phone ? `'${r.customer_phone}` : '-'; // Kasih petik satu biar gak dianggap rumus
            
            // Format CSV Pake TITIK KOMA (;)
            return `"${r.customer_name || 'Anonim'}";"${phone}";"${r.rating}";"${cleanComment}";"${date}";"${source}"`;
        });

        // 3. Gabungin Header & Data (Join pake ;)
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + [headers.join(";"), ...rows].join("\n");

        // 4. Download
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
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white p-6 md:p-10 font-sans">
      
      {/* HEADER + TOMBOL ACTION */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-3xl font-black mb-2">Inbox Review</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Database pelanggan & feedback kamu.</p>
        </div>
        
        <div className="flex gap-3">
            {/* TOMBOL EXPORT CSV */}
            <button 
                onClick={handleExportCSV}
                disabled={isExporting || filteredReviews.length === 0}
                className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-800 text-white font-bold px-5 py-3 rounded-xl hover:bg-zinc-700 transition active:scale-95 disabled:opacity-50 border border-zinc-700"
            >
                {isExporting ? <Loader2 size={20} className="animate-spin"/> : <Download size={20}/>}
                Export CSV
            </button>

            {/* TOMBOL BUAT KONTEN IG */}
            <Link 
                href="/dashboard/testimonials" 
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-5 py-3 rounded-xl transition shadow-lg shadow-green-900/20 active:scale-95"
            >
                <Smartphone size={20}/>
                Buat Konten IG
            </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* TOOLBAR SEARCH & FILTER */}
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

        {/* LIST REVIEW */}
        {filteredReviews.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 border-dashed">
                <MessageSquare className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" size={48}/>
                <h3 className="text-lg font-bold text-zinc-500">Belum ada review yang cocok</h3>
                <p className="text-sm text-zinc-400">Coba ganti filter atau tunggu pelanggan ngisi ya.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {filteredReviews.map((review) => {
                    const sourceName = storeNames[review.campaign_id] || "❓ Toko Tidak Dikenal";
                    const isPusat = sourceName.includes("Pusat");
                    const dateString = new Date(review.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

                    return (
                        <div key={review.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
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
                                {review.customer_phone && review.customer_phone !== "-" && (<div className="mt-3 flex gap-2"><a href={`https://wa.me/${review.customer_phone}`} target="_blank" className="inline-flex items-center gap-2 text-xs font-bold text-green-600 hover:text-green-500 bg-green-500/10 px-3 py-2 rounded-lg transition"><MessageSquare size={14}/> Balas via WhatsApp</a></div>)}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
}