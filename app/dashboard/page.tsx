"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import axios from "axios"; 
import { 
  BarChart3, Star, ExternalLink, 
  Copy, Check, TrendingUp, MousePointer2, 
  QrCode, Plus, ScanLine, Download, 
  AlertCircle, X, ThumbsUp, ArrowLeft, Zap, 
  BellRing, Rocket, Loader2, Bell 
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  
  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  
  // State Statistik Real-time
  const [stats, setStats] = useState({
    totalVisits: 0,
    totalClicks: 0,
    totalReviews: 0,
    happyCustomers: 0, 
    sadCustomers: 0,   
  });

  // UI States
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedQrId, setExpandedQrId] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // STATE NOTIF
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  // --- LOGIKA UTAMA ---
  useEffect(() => {
    let isMounted = true;

    const safetyTimer = setTimeout(() => {
        if (isMounted && loading) {
            setLoading(false);
            if (!errorMsg) setErrorMsg("Koneksi lambat. Coba refresh ya.");
        }
    }, 10000);

    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMsg(""); 

        // 1. Cek User Login
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            if (isMounted) router.push("/login");
            return;
        }

        // 🚀 INIT ONESIGNAL (DENGAN PENGAMAN 'SMART CHECK') 🚀
        if (typeof window !== "undefined") {
            const w = window as any; 
            
            w.OneSignalDeferred = w.OneSignalDeferred || [];
            w.OneSignalDeferred.push(async function (OneSignal: any) {
                
                // 🔥 PENGAMAN UTAMA DISINI 🔥
                if (!OneSignal.initialized) {
                    console.log("⚠️ Layout telat, Dashboard ambil alih init OneSignal.");
                    await OneSignal.init({
                        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "72b814c6-9bef-42b8-9fd6-1778f59e6537", 
                        safari_web_id: "web.onesignal.auto.xxxxx", 
                        notifyButton: { enable: true }, 
                    });
                } else {
                    console.log("✅ Aman, OneSignal sudah dinyalakan oleh Layout.");
                }
                
                // Login tetep jalan biar notifnya personal
                await OneSignal.login(user.id);
                
                // Cek status subscribe
                if (OneSignal.User && OneSignal.User.PushSubscription) {
                    setIsSubscribed(OneSignal.User.PushSubscription.optedIn);
                    
                    OneSignal.User.PushSubscription.addEventListener("change", (event: any) => {
                        setIsSubscribed(event.current.optedIn);
                    });
                }
            });
        }

        // 2. Ambil Data Toko Lama
        const { data: campaignsData, error: campError } = await supabase
          .from("campaigns")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (campError) throw campError;

        // 3. Ambil Data Toko Baru
        const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        let finalCampaigns = campaignsData || [];

        // -------------------------------------------------------------
        // 🔥🔥🔥 BAGIAN PENYELAMAT QR CODE (FIX) 🔥🔥🔥
        // Logic: Kita paksa cek satu-satu. Kalau slug kosong, kita buatin dari nama brand.
        // Ini biar QR Code gak nge-generate link buntung (cuma domain doang).
        finalCampaigns = finalCampaigns.map((c: any) => ({
            ...c,
            slug: (c.slug && c.slug.length > 1) 
                  ? c.slug 
                  : c.brand_name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
        }));
        // -------------------------------------------------------------

        if (profileData && profileData.business_name) {
            const profileAsCampaign = {
                id: profileData.id,
                user_id: profileData.id,
                brand_name: profileData.business_name,
                // Pastikan Profile juga punya fallback slug
                slug: profileData.slug || profileData.business_name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
                visits: profileData.visits || 0,
                clicks: profileData.clicks || 0,
                created_at: profileData.updated_at
            };

            const exists = finalCampaigns.find((c: any) => c.id === profileAsCampaign.id);
            if (!exists) {
                finalCampaigns = [profileAsCampaign, ...finalCampaigns];
            }
        }

        if (isMounted) {
          setCampaigns(finalCampaigns);

          // 4. HITUNG STATISTIK
          const campaignIds = finalCampaigns.map((c: any) => c.id);
          let totalRev = 0, happy = 0, sad = 0;
          let visits = 0, clicks = 0;

          finalCampaigns.forEach(c => {
              visits += (c.visits || 0);
              clicks += (c.clicks || 0);
          });

          if (campaignIds.length > 0) {
              const { data: feedbacks } = await supabase
                .from("feedbacks")
                .select("rating")
                .in("campaign_id", campaignIds);

              if (feedbacks && feedbacks.length > 0) {
                  totalRev = feedbacks.length;
                  feedbacks.forEach((f: any) => {
                      if (f.rating >= 4) happy++; else sad++;
                  });
              }
          }
          
          setStats({
            totalVisits: visits,
            totalClicks: clicks,
            totalReviews: totalRev,
            happyCustomers: happy,
            sadCustomers: sad
          });
        }

      } catch (err: any) {
        console.error("Dashboard Error:", err);
        if (isMounted) setLoading(false);
      } finally {
        if (isMounted) setLoading(false);
        clearTimeout(safetyTimer);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [router]);

  // --- HELPER FUNCTIONS ---
  const copyToClipboard = (slug: string, id: string) => {
    // Pengaman Link juga di sini
    const validSlug = (slug && slug.length > 1) ? slug : "error-link";
    const url = `${window.location.origin}/${validSlug}`;
    
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleQr = (id: string) => {
    if (expandedQrId === id) setExpandedQrId(null);
    else setExpandedQrId(id);
  };

  const handleDownloadQr = async (slug: string, brandName: string, id: string) => {
    setDownloadingId(id);
    
    // Pengaman Link juga di sini
    const validSlug = (slug && slug.length > 1) ? slug : brandName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const fullUrl = `${window.location.origin}/${validSlug}`;

    try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${fullUrl}`;
        const response = await fetch(qrUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `QR-Review-${brandName.replace(/\s+/g, '-')}.png`; 
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Gagal download:", error);
        window.open(`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${fullUrl}`, '_blank');
    } finally {
        setDownloadingId(null);
    }
  };

  const handleTestNotification = async (rating: number, type: string) => {
     try {
        setIsSendingNotif(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        await axios.post('/api/notify', {
            rating: rating,
            comment: `Ini adalah tes notifikasi ${type}. Semangat codingnya! 🚀`,
            brand_name: "ReviewBoost Demo",
            customer_name: "Developer Ganteng",
            phone: "0812-TES-TES",
            owner_id: user?.id, 
            owner_email: user?.email 
        });

        alert(`✅ Sukses! Cek HP atau Desktop lu. Harusnya ada notif "${type}".`);
     } catch (error) {
        console.error("Gagal kirim notif:", error);
        alert("❌ Gagal kirim notif. Pastikan API Key benar.");
     } finally {
        setIsSendingNotif(false);
     }
  };

  // 🔥 UPDATE FUNGSI SUBSCRIBE (VERSI PAKSA POPUP) 🔥
  const handleSubscribe = () => {
    if (typeof window !== "undefined") {
        const w = window as any;
        
        if (w.OneSignal) {
            console.log("Memaksa browser minta izin notif...");
            w.OneSignal.User.PushSubscription.optIn();
        } else {
            console.log("OneSignal belum siap loading.");
            alert("Sistem notifikasi belum siap. Tunggu sebentar dan coba lagi.");
        }
    }
  };

  // --- TAMPILAN UI ---
  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4 pt-20 bg-zinc-50 dark:bg-black transition-colors duration-300">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="animate-pulse">Lagi sinkron data...</p>
    </div>
  );

  if (errorMsg) return (
    <div className="h-full flex flex-col items-center justify-center text-zinc-900 dark:text-white p-6 text-center pt-20 bg-zinc-50 dark:bg-black transition-colors duration-300">
        <div className="p-4 rounded-full bg-red-500/10 mb-4 animate-bounce"><AlertCircle size={48} className="text-red-500"/></div>
        <h2 className="text-2xl font-bold mb-2">Waduh, Ada Gangguan!</h2>
        <p className="text-zinc-500 mb-6">{errorMsg}</p>
        <button onClick={() => window.location.reload()} className="bg-zinc-900 text-white dark:bg-white dark:text-black font-bold px-8 py-3 rounded-xl hover:bg-zinc-700 dark:hover:bg-zinc-200 transition">Muat Ulang</button>
    </div>
  );

  return (
    <div className="w-full text-zinc-900 dark:text-white font-sans p-4 md:p-8 relative bg-zinc-50 dark:bg-black transition-colors duration-300 min-h-screen">
        
        <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
        <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-200 dark:border-zinc-800/50 pb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-2">
                        Dashboard Founder
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">Pantau reputasi bisnismu secara real-time!</p>
                </div>
                <Link 
                    href="/dashboard/create" 
                    className="group bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold px-6 py-3 rounded-2xl flex items-center gap-3 transition shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:-translate-y-1"
                >
                    <Plus size={20} strokeWidth={3} /> Buat Toko Baru
                </Link>
            </div>

            {/* NOTIFICATION BOX */}
            <div className="bg-white/50 dark:bg-zinc-900/30 backdrop-blur-md border border-zinc-200 dark:border-amber-500/20 rounded-3xl p-6 relative overflow-hidden group shadow-sm">
               <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                   <div className="flex items-start gap-4">
                       <div className={`p-3 rounded-xl border ${isSubscribed ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                           {isSubscribed ? <Check size={24} /> : <BellRing size={24} className={isSubscribed ? "" : "animate-pulse"} />}
                       </div>
                       <div>
                           <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                               Service Recovery System
                               {isSubscribed ? (
                                   <span className="text-[10px] bg-green-500 text-black px-2 py-0.5 rounded font-bold uppercase">Connected</span>
                               ) : (
                                   <span className="text-[10px] bg-zinc-500 text-white px-2 py-0.5 rounded font-bold uppercase">Disconnected</span>
                               )}
                           </h3>
                           <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 max-w-lg">
                               {isSubscribed 
                                ? "Notifikasi aktif! HP lu bakal bunyi kalau ada review masuk." 
                                : "Klik tombol 'Aktifkan Notif' biar gak ketinggalan komplain customer!"}
                           </p>
                       </div>
                   </div>

                   <div className="flex gap-3 w-full md:w-auto">
                      {!isSubscribed ? (
                          <button 
                            onClick={handleSubscribe}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-zinc-900 text-white dark:bg-white dark:text-black px-5 py-3 rounded-xl font-bold text-sm transition hover:scale-105 active:scale-95 shadow-lg"
                          >
                            <Bell size={16}/> Aktifkan Notif
                          </button>
                      ) : (
                          <>
                              <button 
                                onClick={() => handleTestNotification(1, "BAHAYA (⭐1)")}
                                disabled={isSendingNotif}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-500 border border-red-500/20 px-5 py-3 rounded-xl font-bold text-sm transition hover:scale-105 active:scale-95 disabled:opacity-50"
                              >
                                {isSendingNotif ? <Loader2 size={16} className="animate-spin"/> : "😡 Tes Bahaya"}
                              </button>
                              <button 
                                onClick={() => handleTestNotification(5, "AMAN (⭐5)")}
                                disabled={isSendingNotif}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-500 border border-green-500/20 px-5 py-3 rounded-xl font-bold text-sm transition hover:scale-105 active:scale-95 disabled:opacity-50"
                              >
                                {isSendingNotif ? <Loader2 size={16} className="animate-spin"/> : "🌟 Tes Aman"}
                              </button>
                          </>
                      )}
                   </div>
               </div>
            </div>

            {/* STATISTIK */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* KUNJUNGAN */}
                <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2rem] relative group hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-500 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/50 backdrop-blur-sm">
                    <div className="absolute top-6 right-6 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition">
                        <TrendingUp size={20}/>
                    </div>
                    <div className="mt-8">
                        <div className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-1 group-hover:scale-110 origin-left transition duration-300">{stats.totalVisits}</div>
                        <p className="text-zinc-500 font-medium text-sm group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition">Total Kunjungan</p>
                    </div>
                    <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full mt-6 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-zinc-400 to-zinc-600 dark:from-white dark:to-zinc-400 w-[60%] rounded-full group-hover:w-[80%] transition-all duration-1000"></div>
                    </div>
                </div>

                {/* KLIK */}
                <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2rem] relative group hover:border-blue-500/30 transition duration-500 hover:shadow-2xl hover:shadow-blue-900/10 backdrop-blur-sm">
                    <div className="absolute top-6 right-6 p-2 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition">
                        <MousePointer2 size={20}/>
                    </div>
                    <div className="mt-8">
                        <div className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-1 group-hover:scale-110 origin-left transition duration-300">{stats.totalClicks}</div>
                        <p className="text-zinc-500 font-medium text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">Total Klik Link</p>
                    </div>
                    <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full mt-6 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-[40%] rounded-full group-hover:w-[60%] transition-all duration-1000"></div>
                    </div>
                </div>

                {/* REVIEW */}
                <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2rem] relative group hover:border-green-500/30 transition duration-500 hover:shadow-2xl hover:shadow-green-900/10 backdrop-blur-sm">
                    <div className="absolute top-6 right-6 p-2 bg-green-500/10 rounded-lg text-green-600 dark:text-green-500 group-hover:bg-green-500 group-hover:text-white transition">
                        <Star size={20}/>
                    </div>
                    <div className="mt-8">
                        <div className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-1 group-hover:scale-110 origin-left transition duration-300">{stats.totalReviews}</div>
                        <p className="text-zinc-500 font-medium text-sm group-hover:text-green-600 dark:group-hover:text-green-400 transition">Total Review Masuk</p>
                    </div>
                    <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full mt-6 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-600 to-green-400 w-[75%] rounded-full group-hover:w-[90%] transition-all duration-1000"></div>
                    </div>
                </div>
            </div>

            {/* INSIGHT PELANGGAN */}
            <div className="pt-8 pb-4">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <Zap size={20}/>
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Insight Pelanggan</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* HAPPY */}
                    <Link href="/dashboard/reviews" className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900/50 dark:to-black border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2rem] flex items-center justify-between hover:border-green-500/30 transition duration-500 group relative overflow-hidden backdrop-blur-sm cursor-pointer shadow-sm">
                        <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-green-500/10 text-green-600 dark:text-green-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Happy Vibes</span>
                            </div>
                            <div className="text-5xl font-black text-zinc-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition duration-300">{stats.happyCustomers}</div>
                            <p className="text-zinc-500 font-medium text-sm">Pelanggan Puas (⭐ 4-5)</p>
                        </div>
                        <div className="w-20 h-20 rounded-full border-[6px] border-zinc-100 dark:border-zinc-800 border-t-green-500 flex items-center justify-center shadow-xl relative z-10 bg-white dark:bg-black">
                             <ThumbsUp size={24} className="text-green-600 dark:text-green-500"/>
                        </div>
                    </Link>

                    {/* COMPLAINTS */}
                    <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900/50 dark:to-black border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2rem] flex items-center justify-between hover:border-red-500/30 transition duration-500 group relative overflow-hidden backdrop-blur-sm shadow-sm">
                        <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-red-500/10 text-red-600 dark:text-red-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Perlu Perhatian</span>
                            </div>
                            <div className="text-5xl font-black text-zinc-900 dark:text-white mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition duration-300">{stats.sadCustomers}</div>
                            <p className="text-zinc-500 font-medium text-sm">Komplain / Isu (⭐ 1-3)</p>
                        </div>
                        <Link href="/dashboard/reviews" className="relative z-10 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-bold px-5 py-3 rounded-xl transition flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95">
                            Cek Inbox <ArrowLeft size={14} className="rotate-180"/>
                        </Link>
                    </div>
                </div>
            </div>

            {/* LIST PROJECT / TOKO */}
            <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                        <ScanLine size={20}/>
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Project Aktif</h2>
                </div>
            </div>
            
            {campaigns.length === 0 ? (
                <div className="bg-white/50 dark:bg-zinc-900/30 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-[2rem] p-16 text-center">
                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Rocket size={32} className="text-zinc-400 dark:text-zinc-500"/>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Belum ada toko yang didaftarkan</h3>
                    <p className="text-zinc-500 text-sm mb-8 max-w-sm mx-auto">Mulai kumpulkan review bintang 5 pertamamu dengan membuat link toko baru.</p>
                    <Link href="/dashboard/create" className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition shadow-lg shadow-black/10 dark:shadow-white/10">
                        <Plus size={18}/> Buat Toko Pertama
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {campaigns.map((camp) => (
                        <div key={camp.id} className={`group bg-white dark:bg-zinc-900/40 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 md:p-8 transition duration-500 hover:border-amber-500/30 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 ${expandedQrId === camp.id ? 'ring-2 ring-amber-500/20 bg-zinc-50 dark:bg-zinc-900' : ''}`}>
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-extrabold text-2xl text-zinc-900 dark:text-white group-hover:text-amber-500 transition duration-300">{camp.brand_name}</h3>
                                        <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-green-500/20">Active</span>
                                    </div>
                                    <a href={`/${camp.slug}`} target="_blank" className="text-zinc-500 text-sm hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition">
                                        <ExternalLink size={14}/> reviewboost.id/{camp.slug}
                                    </a>
                                </div>
                                
                                <div className="flex gap-2 w-full md:w-auto">
                                    <button 
                                        onClick={() => copyToClipboard(camp.slug, camp.id)} 
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-zinc-100 dark:bg-white text-zinc-900 dark:text-black hover:bg-zinc-200 dark:hover:bg-zinc-200 transition shadow-lg shadow-black/5 dark:shadow-white/5 active:scale-95 border border-zinc-200 dark:border-transparent"
                                    >
                                        {copiedId === camp.id ? <Check size={16} className="text-green-600"/> : <Copy size={16}/>} 
                                        {copiedId === camp.id ? "Tersalin!" : "Salin Link"}
                                    </button>
                                    
                                    <Link 
                                        href={`/dashboard/analytics/${camp.id}`} 
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-white transition active:scale-95"
                                    >
                                        <BarChart3 size={16}/> Analitik
                                    </Link>
                                    
                                    <button 
                                        onClick={() => toggleQr(camp.id)} 
                                        className={`flex items-center justify-center p-3 rounded-xl border transition ${expandedQrId === camp.id ? 'bg-amber-500 border-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                                    >
                                        <QrCode size={20}/>
                                    </button>
                                </div>
                            </div>

                            {expandedQrId === camp.id && (
                                <div className="mt-6 pt-8 border-t border-zinc-200 dark:border-zinc-800/50 animate-in slide-in-from-top-4 fade-in duration-300">
                                    <div className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-8">
                                        <div className="bg-white p-3 rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/50 rotate-2 hover:rotate-0 transition duration-300 border border-zinc-100">
                                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.origin}/${camp.slug}`} alt="QR Code" className="w-32 h-32"/>
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h4 className="text-zinc-900 dark:text-white text-lg font-bold mb-2">QR Code Siap Cetak 🖨️</h4>
                                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 max-w-md">
                                                Cetak QR Code ini dan tempel di meja kasir atau kemasan produkmu. Pelanggan tinggal scan buat kasih review.
                                            </p>
                                            
                                            <button 
                                                onClick={() => handleDownloadQr(camp.slug, camp.brand_name, camp.id)}
                                                disabled={downloadingId === camp.id}
                                                className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400 text-sm font-bold bg-amber-500/10 hover:bg-amber-500/20 px-5 py-3 rounded-xl transition border border-amber-500/20 disabled:opacity-50 disabled:cursor-wait"
                                            >
                                                {downloadingId === camp.id ? <Loader2 size={16} className="animate-spin"/> : <Download size={16}/>} 
                                                {downloadingId === camp.id ? "Mendownload..." : "Download Versi HD (1000px)"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* UPGRADE MODAL */}
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-full max-w-5xl rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowUpgradeModal(false)} className="absolute top-6 right-6 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white z-20 border border-zinc-200 dark:border-zinc-800"><X size={20} /></button>
                        
                        <div className="text-center mb-12 mt-6">
                            <span className="text-amber-500 text-sm font-bold uppercase tracking-widest mb-2 block">Premium Access</span>
                            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white mb-4">Upgrade Bisnismu 🚀</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto">Investasi kecil untuk reputasi bisnis yang tak ternilai harganya.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             {/* Pricing Cards */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}