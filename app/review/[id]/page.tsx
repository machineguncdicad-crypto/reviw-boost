"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Star, MessageCircle, Send, Loader2, ThumbsUp, MapPin, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

// Tipe Data
type Campaign = {
  id: string;
  brand_name: string;        
  google_review_link: string; 
  user_id: string;
  slug: string;              
};

export default function ReviewPageLuxury({ params }: { params: { id: string } }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State Form
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  // 1. AMBIL DATA TOKO
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!params?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        setLoading(false);
        return; 
      }

      setCampaign({
          id: data.id,
          brand_name: data.business_name || "Nama Toko",
          google_review_link: data.google_map_url || "",
          user_id: data.id,
          slug: data.id
      });
      setLoading(false);
    };
    fetchCampaign();
  }, [params.id]);

  // 2. FUNGSI SUBMIT (YANG SUDAH DIPERBAIKI)
  const handleSubmit = async () => {
    if (rating === 0) return; 
    if (!campaign) return;

    setIsSubmitting(true);

    try {
      console.log("Mencoba kirim ke database...");

      // A. SIMPAN KE DATABASE (SUPABASE)
      const { error: dbError } = await supabase
        .from("feedbacks") 
        .insert({
          campaign_id: campaign.id,
          customer_name: "Pelanggan", // Default name
          customer_phone: "-", 
          rating: rating,
          comment: comment,
          status: rating >= 4 ? 'published' : 'blocked'
        });

      if (dbError) {
        console.error("Database Error:", dbError);
        throw new Error(dbError.message); 
      }

      // 🔥 B. KIRIM NOTIFIKASI (FIXED) 🔥
      // Kita pakai await biar yakin terkirim sebelum pindah halaman
      await fetch('/api/notify', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          rating: rating,
          comment: comment,
          brand_name: campaign.brand_name,
          customer_name: "Pelanggan", // Kirim nama biar muncul di notif OneSignal
          phone: "-" 
        })
      });

      // C. SUKSES!
      setIsSubmitted(true);

    } catch (err: any) {
      console.error("SUBMIT ERROR:", err);
      alert("Gagal kirim: " + (err.message || "Unknown Error"));
      setIsSubmitting(false);
    }
  };

  // --- TAMPILAN LOADING MEWAH ---
  if (loading) return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-zinc-950 flex items-center justify-center text-amber-500">
      <Loader2 className="animate-spin" size={40}/>
    </div>
  );
  
  if (!campaign) return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <p>Toko tidak ditemukan.</p>
      </div>
  ); 

  // --- BACKGROUND CONTAINER ---
  const BackgroundContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-zinc-950 text-white font-sans flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        {children}
    </div>
  );

  // --- PAGE SUKSES ---
  if (isSubmitted) {
    const isHappy = rating >= 4;
    return (
      <BackgroundContainer>
        <div className="backdrop-blur-xl bg-zinc-900/70 border border-white/10 p-8 md:p-12 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-500">
          <div className={`inline-flex p-4 rounded-full mb-6 ${isHappy ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
            {isHappy ? <Sparkles size={48} className="animate-pulse"/> : <ThumbsUp size={48}/>}
          </div>
          <h2 className="text-3xl font-extrabold mb-3 text-white">Terima Kasih! 🙏</h2>
          <p className="text-zinc-400 mb-10 text-lg">Masukan Anda sangat berarti.</p>

          {isHappy ? (
            <a href={campaign.google_review_link || "#"} target="_blank" className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                 <MapPin size={22}/> Posting di Google Maps
            </a>
          ) : (
            <button onClick={() => window.open(`https://wa.me/?text=Halo Owner ${campaign.brand_name}, saya mau kasih masukan...`, '_blank')} className="block w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-green-900/20 flex items-center justify-center gap-2">
                 <MessageCircle size={22}/> Chat Owner (WA)
            </button>
          )}
        </div>
      </BackgroundContainer>
    );
  }

  // --- FORM INPUT ---
  const activeStar = hoveredStar || rating;
  return (
    <BackgroundContainer>
      <div className="w-full max-w-[500px] animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 mb-3">{campaign.brand_name}</h1>
            <p className="text-zinc-400 text-lg">Bagaimana pengalaman Anda?</p>
        </div>

        <div className="backdrop-blur-xl bg-zinc-900/70 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex justify-center gap-3 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="transition-all duration-300 transform hover:scale-110 active:scale-95"
              >
                <Star 
                  size={48} 
                  fill={activeStar >= star ? "#fbbf24" : "transparent"} 
                  className={`${activeStar >= star ? "text-amber-400" : "text-zinc-700"} transition-colors`}
                />
              </button>
            ))}
          </div>
          
          <textarea
            placeholder="Ceritakan pengalaman Anda..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-2xl p-5 text-white h-32 resize-none mb-8 focus:outline-none focus:border-amber-500/50 transition"
          />

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-bold py-5 rounded-2xl transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin"/> : <Send/>} {isSubmitting ? "Mengirim..." : "Kirim Masukan"}
          </button>
        </div>
      </div>
    </BackgroundContainer>
  );
}