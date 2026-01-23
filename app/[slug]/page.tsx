"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Star, MessageCircle, MapPin, Smile, Frown, 
  ArrowRight, Copy, Check, User, Phone, Loader2, Send, CheckCircle2 
} from "lucide-react";
import { useParams } from "next/navigation";

// --- 1. KAMUS BAHASA (FULL INDO) ---
const translations: any = {
  id: {
    title: "Gimana pengalamanmu?",
    subtitle: "Kasih bintang buat pelayanan kami hari ini ya.",
    placeholder_good: "Wah makasih! Ceritain dong apa yang bikin kamu seneng...",
    placeholder_bad: "Waduh maaf ya. Kasih tau kami apa yang kurang...",
    name_placeholder: "Nama Kamu (Boleh dikosongin)",
    phone_placeholder: "Nomor WA (Boleh dikosongin)",
    btn_submit: "Kirim Review",
    btn_sending: "Lagi ngirim...",
    thank_title: "Makasih Banyak! 🎉",
    thank_desc: "Masukan kamu berharga banget buat kemajuan bisnis kami.",
    thank_internal_title: "Masukan Diterima",
    thank_internal_desc: "Makasih udah jujur. Pesan ini udah kami terima dan bakal langsung dievaluasi sama Owner.",
    help_ask: "Boleh minta tolong dikit? 🙏",
    help_desc: "Copy ulasan kamu tadi & tempel di Google Maps ya. Ini ngebantu banget loh!",
    btn_copy: "Salin Teks Ulasan",
    btn_copied: "Udah Disalin!",
    btn_maps: "Posting di Google Maps",
    footer: "Powered by ReviewBoost",
    store_not_found: "Toko Gak Ketemu",
    store_check_link: "Coba cek lagi link QR Code-nya ya."
  },
  en: {
    title: "How was your experience?",
    subtitle: "Please rate our service today.",
    placeholder_good: "Tell us about your great experience...",
    placeholder_bad: "Tell us what went wrong...",
    name_placeholder: "Name (Optional)",
    phone_placeholder: "WhatsApp (Optional)",
    btn_submit: "Submit Review",
    btn_sending: "Sending...",
    thank_title: "Thank You! 🎉",
    thank_desc: "Your feedback means a lot to us.",
    thank_internal_title: "Feedback Received",
    thank_internal_desc: "Thank you for your honesty. We will evaluate this internally.",
    help_ask: "Can we ask for a small favor? 🙏",
    help_desc: "Please copy your review and paste it on Google Maps.",
    btn_copy: "Copy Text",
    btn_copied: "Copied!",
    btn_maps: "Post on Google Maps",
    footer: "Powered by ReviewBoost",
    store_not_found: "Store Not Found",
    store_check_link: "Please check the link."
  }
};

// --- 2. MAPPING WARNA ---
const colorMap: any = {
    amber: { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500", ring: "focus:ring-amber-500", light: "bg-amber-500/10", star: "text-amber-400 fill-amber-400" },
    blue: { bg: "bg-blue-600", text: "text-blue-600", border: "border-blue-600", ring: "focus:ring-blue-600", light: "bg-blue-600/10", star: "text-blue-400 fill-blue-400" },
    red: { bg: "bg-red-600", text: "text-red-600", border: "border-red-600", ring: "focus:ring-red-600", light: "bg-red-600/10", star: "text-red-400 fill-red-400" },
    green: { bg: "bg-green-600", text: "text-green-600", border: "border-green-600", ring: "focus:ring-green-600", light: "bg-green-600/10", star: "text-green-400 fill-green-400" },
    purple: { bg: "bg-purple-600", text: "text-purple-600", border: "border-purple-600", ring: "focus:ring-purple-600", light: "bg-purple-600/10", star: "text-purple-400 fill-purple-400" },
};

export default function PublicReviewPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [step, setStep] = useState(1); 
  const [feedback, setFeedback] = useState("");
  
  // Data Customer
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // STATE SETTING
  const [minRatingGoogle, setMinRatingGoogle] = useState(4); 
  const [brandColor, setBrandColor] = useState("amber");
  const [language, setLanguage] = useState("id");

  const hasCountedVisit = useRef(false);

  // 1. LOAD DATA
  useEffect(() => {
    const fetchStore = async () => {
      try {
        let currentStore = null;
        let ownerId = null; 
        
        const { data: profile } = await supabase.from("profiles").select("*").eq("slug", slug).single();
        
        if (profile) {
            setStore(profile);
            currentStore = profile;
            ownerId = profile.id;
            
            if (profile.min_rating_google) setMinRatingGoogle(profile.min_rating_google);
            if (profile.brand_color) setBrandColor(profile.brand_color);
            if (profile.language) setLanguage(profile.language);

        } else {
            const { data: camp } = await supabase.from("campaigns").select("*").eq("slug", slug).single();
            if (camp) {
                setStore({ ...camp, business_name: camp.brand_name });
                currentStore = { ...camp, business_name: camp.brand_name };
                ownerId = camp.user_id; 
            }
        }

        if (currentStore && ownerId && !profile) {
            const { data: ownerSettings } = await supabase
                .from("profiles")
                .select("min_rating_google, brand_color, language")
                .eq("id", ownerId)
                .single();
            
            if (ownerSettings) {
                if (ownerSettings.min_rating_google) setMinRatingGoogle(ownerSettings.min_rating_google);
                if (ownerSettings.brand_color) setBrandColor(ownerSettings.brand_color);
                if (ownerSettings.language) setLanguage(ownerSettings.language);
            }
        }

        if (currentStore && !hasCountedVisit.current) {
            hasCountedVisit.current = true;
            await supabase.rpc('increment_visit', { row_id: currentStore.id });
        }

      } catch (e) {
          console.error("Error fetching store:", e);
      } finally {
          setLoading(false);
      }
    };

    if (slug) fetchStore();
  }, [slug]);

  // 2. NOTIFIKASI
  const sendNotification = async (stars: number, text: string, custName: string) => {
    const targetOwnerId = store.user_id || store.id;
    if (!targetOwnerId) return; 

    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            owner_id: targetOwnerId, 
            rating: stars,
            comment: text,
            brand_name: store.business_name || store.brand_name,
            customer_name: custName,
            phone: phone
        })
      });
      console.log("Notif sent via API!");
    } catch (e) { 
        console.error("Gagal kirim notif:", e); 
    }
  };

  // 3. RATING
  const handleRating = (star: number) => {
    setRating(star);
    setTimeout(() => setStep(2), 300);
  };

  // 4. SUBMIT
  const submitFeedback = async () => {
    setSending(true);
    
    await supabase.from("feedbacks").insert({
        campaign_id: store.id, 
        rating: rating, 
        comment: feedback,
        customer_name: name || "Anonim",
        customer_phone: phone || "-" 
    });

    await sendNotification(rating, feedback, name || "Anonim");

    setTimeout(() => { 
        setStep(3); 
        setSending(false); 
    }, 1000);
  };

  // 🔥 5. GOOGLE MAPS (VERSI BERSIH - FIRE AND FORGET) 🔥
  const handleGoToMaps = () => {
      // 1. Ambil URL
      const url = store.google_map_url;
      if (!url) return;

      // 2. Logic Buka Link (HP vs Laptop)
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
          window.location.href = url;
      } else {
          window.open(url, '_blank');
      }

      // 3. Rekam Klik (Tanpa Then/Catch Biar Gak Merah)
      // Pake 'void' biar TypeScript tau kita sengaja gak nungguin hasilnya
      void supabase.rpc('increment_click', { row_id: store.id });
  };

  const copyFeedback = () => {
      navigator.clipboard.writeText(feedback);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const isEligibleForMaps = rating >= minRatingGoogle;
  const theme = colorMap[brandColor] || colorMap.amber;
  const t = translations[language] || translations.id;

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin text-amber-500"/></div>;
  
  if (!store) return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-500 p-6 text-center">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-2xl">🤷‍♂️</div>
          <h1 className="text-xl font-bold text-white mb-2">{t.store_not_found}</h1>
          <p className="text-sm">{t.store_check_link}</p>
      </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        <div className={`absolute top-0 w-full h-96 bg-gradient-to-b ${theme.light.replace("/10", "/20")} to-transparent blur-3xl pointer-events-none`}></div>
        
        {step === 1 && (
            <div className="text-center z-10 animate-in zoom-in-95 w-full max-w-sm">
                <div className={`w-24 h-24 bg-zinc-900 border-2 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl overflow-hidden ${theme.border}`}>
                    {store.avatar_url ? (
                        <img src={store.avatar_url} className="w-full h-full object-cover"/>
                    ) : (
                        <MapPin size={32} className={theme.text}/>
                    )}
                </div>
                <h1 className="text-2xl font-black mb-2 tracking-tight">{store.business_name}</h1>
                <p className="text-zinc-400 mb-10 text-sm font-medium">{t.subtitle}</p>
                <div className="flex justify-between px-2 mb-8">
                    {[1,2,3,4,5].map(s => (
                        <Star 
                            key={s} 
                            size={42} 
                            className={`cursor-pointer transition hover:scale-125 duration-300 ${rating >= s ? theme.star : "text-zinc-800 fill-zinc-800"}`} 
                            onClick={() => handleRating(s)} 
                            onMouseEnter={() => setRating(s)}
                        />
                    ))}
                </div>
            </div>
        )}

        {step === 2 && (
            <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4">
                <div className="text-center mb-8">
                    {isEligibleForMaps ? (
                        <><Smile size={56} className={`${theme.text} mx-auto mb-3 animate-bounce`}/><h2 className="text-2xl font-bold">Mantap! 🎉</h2></>
                    ) : (
                        <><Frown size={56} className="text-zinc-500 mx-auto mb-3"/><h2 className="text-2xl font-bold">Waduh... 😔</h2></>
                    )}
                </div>
                
                <div className="space-y-4 bg-zinc-900/50 backdrop-blur-md p-6 rounded-3xl border border-zinc-800/50 shadow-xl">
                    <textarea 
                        value={feedback} 
                        onChange={e=>setFeedback(e.target.value)} 
                        placeholder={isEligibleForMaps ? t.placeholder_good : t.placeholder_bad} 
                        className={`w-full h-32 bg-black/50 border border-zinc-700 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 transition-all resize-none text-sm ${theme.ring}`} 
                        autoFocus
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                            <User size={14} className="absolute left-3 top-3.5 text-zinc-500"/>
                            <input 
                                type="text" 
                                placeholder={t.name_placeholder} 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className={`w-full bg-black/50 border border-zinc-700 rounded-xl pl-9 pr-3 py-3 text-sm text-white focus:outline-none focus:ring-2 ${theme.ring}`}
                            />
                        </div>
                        <div className="relative">
                            <Phone size={14} className="absolute left-3 top-3.5 text-zinc-500"/>
                            <input 
                                type="tel" 
                                placeholder={t.phone_placeholder} 
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className={`w-full bg-black/50 border border-zinc-700 rounded-xl pl-9 pr-3 py-3 text-sm text-white focus:outline-none focus:ring-2 ${theme.ring}`}
                            />
                        </div>
                    </div>

                    <button 
                        onClick={submitFeedback} 
                        disabled={sending} 
                        className={`w-full font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 text-white flex items-center justify-center gap-2 ${theme.bg}`}
                    >
                        {sending ? <Loader2 className="animate-spin" size={20}/> : <Send size={20}/>}
                        {sending ? t.btn_sending : t.btn_submit}
                    </button>
                    
                    <button onClick={() => setStep(1)} className="w-full text-zinc-500 text-xs py-2 hover:text-white transition">
                        Batal / Ganti Bintang
                    </button>
                </div>
            </div>
        )}

        {step === 3 && (
            <div className="text-center z-10 animate-in zoom-in-95 w-full max-w-sm">
                
                {isEligibleForMaps ? (
                    <>
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${theme.light}`}>
                            <CheckCircle2 size={48} className={theme.text}/>
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{t.thank_title}</h2>
                        <p className="text-zinc-400 text-sm mb-10">{t.thank_desc}</p>
                        
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-full h-1 ${theme.bg}`}></div>
                            
                            <p className="text-white font-bold mb-1">{t.help_ask}</p>
                            <p className="text-zinc-500 text-xs mb-6">{t.help_desc}</p>
                            
                            <button onClick={copyFeedback} className="w-full flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 border border-zinc-800 text-white py-3 rounded-xl mb-3 text-xs font-bold transition">
                                {copied ? <><Check size={14}/> {t.btn_copied}</> : <><Copy size={14}/> {t.btn_copy}</>}
                            </button>

                            <button 
                                onClick={handleGoToMaps} 
                                className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl shadow-lg transition transform active:scale-95 text-white ${theme.bg}`}
                            >
                                {t.btn_maps} <ArrowRight size={18}/>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="bg-zinc-900/80 p-8 rounded-3xl border border-zinc-800">
                        <div className="w-20 h-20 bg-black border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageCircle size={32} className="text-zinc-400"/>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">{t.thank_internal_title}</h2>
                        <p className="text-zinc-400 mt-2 text-sm leading-relaxed">{t.thank_internal_desc}</p>
                        <button onClick={()=>window.location.reload()} className={`mt-8 text-sm font-bold hover:underline ${theme.text}`}>
                            Kembali ke Awal
                        </button>
                    </div>
                )}
            </div>
        )}
        
        <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-[10px] text-zinc-800 font-bold uppercase tracking-widest">{t.footer}</p>
        </div>
    </div>
  );
}