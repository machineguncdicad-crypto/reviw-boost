"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toPng } from "html-to-image";
import { 
  Download, Quote, Star, RefreshCcw, 
  Palette, Share2, Loader2, ImagePlus 
} from "lucide-react";

export default function SocialPostGenerator() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("midnight"); // midnight, sunset, ocean, clean
  const [isDownloading, setIsDownloading] = useState(false);
  
  const previewRef = useRef<HTMLDivElement>(null);

  // 1. AMBIL REVIEW BAGUS (BINTANG 4 & 5) DARI DB
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Ambil ID toko (Campaigns)
        const { data: campaigns } = await supabase
            .from("campaigns")
            .select("id")
            .eq("user_id", user.id);

        const campaignIds = campaigns?.map(c => c.id) || [];
        
        // Ambil ID Profile juga (kalo ada)
        const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
        if (profile) campaignIds.push(profile.id);

        if (campaignIds.length > 0) {
            const { data } = await supabase
                .from("feedbacks")
                .select("*")
                .in("campaign_id", campaignIds)
                .gte("rating", 4) // Cuma ambil bintang 4 ke atas
                .order("created_at", { ascending: false })
                .limit(10); // Ambil 10 terakhir aja

            if (data && data.length > 0) {
                setReviews(data);
                setSelectedReview(data[0]); // Pilih yg pertama default
            }
        }
      } catch (e) {
        console.error("Gagal load review:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // 2. DOWNLOAD POSTER (DENGAN FIX ERROR ONESIGNAL) 🔥
  const handleDownload = async () => {
    if (previewRef.current === null) return;
    setIsDownloading(true);
    
    try {
        // Render gambar dengan opsi KHUSUS biar gak crash kena OneSignal
        const dataUrl = await toPng(previewRef.current, { 
            cacheBust: true, 
            pixelRatio: 3,
            skipFonts: true, // 👈 INI OBATNYA (Biar gak baca CSS OneSignal yang dikunci)
            filter: (node) => {
                // Filter elemen yang gak perlu / bikin error
                const exclusionClasses = ['onesignal-bell-container', 'onesignal-customlink-container'];
                return !exclusionClasses.some((classname) => node.classList?.contains(classname));
            }
        });
        
        const link = document.createElement("a");
        link.download = `Review-Post-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error("Gagal download:", err);
        alert("Gagal memproses gambar. Coba refresh halaman.");
    } finally {
        setIsDownloading(false);
    }
  };

  // 3. TEMA BACKGROUND
  const themes: any = {
      midnight: "bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 text-white",
      sunset: "bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 text-white",
      ocean: "bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 text-white",
      clean: "bg-zinc-50 text-zinc-900 border-4 border-zinc-900",
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black mb-1 flex items-center gap-2">
                <Share2 className="text-pink-500"/> Social Post Maker
            </h1>
            <p className="text-zinc-500">Ubah review pelanggan jadi konten IG Story otomatis.</p>
          </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* KOLOM KIRI: DAFTAR REVIEW (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 h-[600px] overflow-y-auto">
                  <h3 className="font-bold text-zinc-400 text-sm uppercase tracking-widest mb-4">Pilih Review Terbaik</h3>
                  
                  {reviews.length === 0 ? (
                      <div className="text-center py-10 text-zinc-500 flex flex-col items-center">
                          <ImagePlus className="mb-2 opacity-50"/>
                          <p>Belum ada review bintang 5.</p>
                          <p className="text-xs mt-2">Pastikan sudah ada customer yang ngisi review ya!</p>
                      </div>
                  ) : (
                      <div className="space-y-3">
                          {reviews.map((r) => (
                              <div 
                                key={r.id} 
                                onClick={() => setSelectedReview(r)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-105 ${
                                    selectedReview?.id === r.id 
                                    ? "bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-900/20" 
                                    : "bg-black border-zinc-800 hover:border-zinc-600"
                                }`}
                              >
                                  <div className="flex justify-between items-center mb-2">
                                      <span className="font-bold text-sm truncate w-24">{r.customer_name || "Anonim"}</span>
                                      <div className="flex text-amber-500">
                                          {[...Array(r.rating)].map((_,i) => <Star key={i} size={10} fill="currentColor"/>)}
                                      </div>
                                  </div>
                                  <p className="text-xs text-zinc-400 line-clamp-2 italic">"{r.comment || "Tidak ada komentar"}"</p>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>

          {/* KOLOM KANAN: PREVIEW & EDIT (8 cols) */}
          <div className="lg:col-span-8 flex flex-col items-center">
              
              {/* TOOLBAR TEMA */}
              <div className="flex gap-3 mb-6 bg-zinc-900 p-2 rounded-2xl border border-zinc-800">
                  {Object.keys(themes).map((t) => (
                      <button 
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
                            theme === t ? "bg-white text-black" : "text-zinc-500 hover:text-white"
                        }`}
                      >
                          {t}
                      </button>
                  ))}
              </div>

              {/* CANVAS (INI YANG AKAN DIDOWNLOAD) */}
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem]">
                  
                  {selectedReview ? (
                      <div 
                        ref={previewRef}
                        className={`w-[400px] h-[550px] relative flex flex-col items-center justify-center p-10 text-center shadow-2xl transition-all duration-500 ${themes[theme]}`}
                      >
                          {/* DEKORASI */}
                          <Quote size={60} className="opacity-30 mb-6"/>
                          
                          {/* ISI REVIEW */}
                          <div className="relative z-10">
                              <p className="text-2xl font-black leading-snug mb-8 drop-shadow-lg">
                                  "{selectedReview.comment || "Pelayanan sangat memuaskan, sangat rekomendasi!"}"
                              </p>
                              
                              <div className="flex justify-center gap-1 text-yellow-300 mb-4 drop-shadow-md">
                                  {[...Array(selectedReview.rating)].map((_,i) => <Star key={i} size={24} fill="currentColor"/>)}
                              </div>

                              <div className="font-bold text-lg opacity-90">
                                  - {selectedReview.customer_name || "Pelanggan Setia"}
                              </div>
                              <div className="text-xs opacity-60 mt-1 uppercase tracking-widest">Verified Customer</div>
                          </div>

                          {/* FOOTER */}
                          <div className="absolute bottom-8 text-xs font-bold opacity-50 tracking-[0.2em]">
                              REVIEWBOOST.ID
                          </div>
                      </div>
                  ) : (
                      <div className="w-[350px] h-[350px] flex items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded-3xl">
                          Pilih review di sebelah kiri dulu...
                      </div>
                  )}

              </div>

              {/* TOMBOL DOWNLOAD */}
              <button 
                onClick={handleDownload}
                disabled={isDownloading || !selectedReview}
                className="mt-8 bg-white text-black font-bold px-10 py-4 rounded-2xl hover:bg-zinc-200 transition flex items-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-95 disabled:opacity-50"
              >
                  {isDownloading ? <RefreshCcw className="animate-spin"/> : <Download/>}
                  {isDownloading ? "Sedang Mengemas..." : "Download Poster HD"}
              </button>

          </div>
      </div>
    </div>
  );
}