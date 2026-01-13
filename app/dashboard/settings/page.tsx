"use client"; 

import { useState, useEffect } from "react"; 
import { useRouter } from "next/navigation"; 
import { supabase } from "@/lib/supabase"; 
import { 
  Bell, Zap, Save, LogOut, 
  LayoutGrid, Mail, Loader2, Palette, Globe, CheckCircle2, 
  Smartphone, Star 
} from "lucide-react"; 

export default function SettingsPage() {
  const router = useRouter(); 
  const [mounted, setMounted] = useState(false);

  // === 1. STATE ===
  const [activeTab, setActiveTab] = useState("general"); 
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // STATE SETTING
  const [settings, setSettings] = useState({
    brandColor: "amber",
    language: "id", 
    minRatingForGoogle: 4, 
    enableEmailAlert: true, 
  });

  // 🔥 KAMUS BAHASA (TRANSLATION DICTIONARY) 🔥
  const translations: any = {
    id: {
      title: "Pengaturan",
      subtitle: "Kelola preferensi aplikasi dan logika sistem.",
      tabs: { general: "Umum & Branding", routing: "Smart Routing", notif: "Notifikasi" },
      brand_title: "Warna Brand",
      brand_desc: "Warna ini akan muncul di halaman review pelanggan.",
      lang_title: "Bahasa Sistem",
      lang_desc_id: "Bahasa utama",
      lang_desc_en: "Internasional",
      logout_title: "Zona Akun",
      logout_desc: "Keluar dari akun akan mengakhiri sesi Anda saat ini.",
      btn_logout: "Log Out / Keluar",
      btn_save: "Simpan Perubahan",
      btn_saving: "Menyimpan...",
      status_title: "STATUS",
      status_unsaved: "Ada perubahan belum disimpan.",
      routing_title: "Filter Bintang",
      routing_desc: "Tentukan batas minimal bintang agar pelanggan diarahkan ke Google Maps.",
      notif_title: "Notifikasi",
      notif_email: "Laporan Email",
      notif_email_desc: "Terima ringkasan review harian.",
      preview_title: "PREVIEW HP CUSTOMER",
      preview_desc: "Simulasi tampilan di HP pelanggan:",
      preview_card_title: "Nama Toko Anda",
      preview_card_ask: "Bagaimana pengalamanmu?",
      preview_btn: "Kirim Review"
    },
    en: {
      title: "Settings",
      subtitle: "Manage application preferences and system logic.",
      tabs: { general: "General & Branding", routing: "Smart Routing", notif: "Notifications" },
      brand_title: "Brand Color",
      brand_desc: "This color will appear on your customer review page.",
      lang_title: "System Language",
      lang_desc_id: "Main language",
      lang_desc_en: "International",
      logout_title: "Account Zone",
      logout_desc: "Logging out will end your current session.",
      btn_logout: "Log Out",
      btn_save: "Save Changes",
      btn_saving: "Saving...",
      status_title: "STATUS",
      status_unsaved: "You have unsaved changes.",
      routing_title: "Star Filter",
      routing_desc: "Set the minimum star rating to redirect customers to Google Maps.",
      notif_title: "Notifications",
      notif_email: "Email Report",
      notif_email_desc: "Receive daily review summaries.",
      preview_title: "CUSTOMER PREVIEW",
      preview_desc: "Simulation on customer's phone:",
      preview_card_title: "Your Store Name",
      preview_card_ask: "How was your experience?",
      preview_btn: "Submit Review"
    }
  };

  const t = translations[settings.language] || translations.id;

  // === LOAD DATA ===
  useEffect(() => {
    setMounted(true);
    const loadSettings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from("profiles")
                    .select("min_rating_google, brand_color, language, enable_email_alert")
                    .eq("id", user.id)
                    .single();

                if (data) {
                    setSettings(prev => ({
                        ...prev,
                        minRatingForGoogle: data.min_rating_google || 4,
                        brandColor: data.brand_color || "amber",
                        language: data.language || "id",
                        enableEmailAlert: data.enable_email_alert ?? true 
                    }));
                }
            }
        } catch (error) {
            console.error("Gagal load:", error);
        } finally {
            setIsPageLoading(false);
        }
    };
    loadSettings();
  }, []);

  // === SIMPAN ===
  const handleSave = async () => {
    setIsLoading(true); 
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        const { error } = await supabase
            .from("profiles")
            .update({
                min_rating_google: settings.minRatingForGoogle,
                brand_color: settings.brandColor,
                language: settings.language,
                enable_email_alert: settings.enableEmailAlert
            })
            .eq("id", user.id);

        if (error) throw error;
        
        const alertMsg = settings.language === 'en' 
            ? "✅ Success! Settings updated." 
            : "✅ Berhasil! Pengaturan tersimpan.";
            
        setTimeout(() => {
             alert(alertMsg);
             setIsLoading(false); 
        }, 800);
        
    } catch (error: any) {
        alert("Error: " + error.message);
        setIsLoading(false); 
    }
  };

  // 🔥 UPDATE: LOGOUT KE LANDING PAGE 🔥
  const handleLogout = async () => {
    const confirmMsg = settings.language === 'en' ? "Are you sure?" : "Yakin mau keluar?";
    if(!confirm(confirmMsg)) return;
    
    setIsLoggingOut(true);
    try {
        await supabase.auth.signOut(); 
        
        // Refresh biar cache auth bersih
        router.refresh();
        
        // Redirect ke Landing Page (Home)
        router.push("/"); 
    } catch (error) { 
        console.error(error); 
        setIsLoggingOut(false); 
    }
  };

  const colorMap: any = {
      amber: "bg-amber-500", blue: "bg-blue-600", red: "bg-red-600", green: "bg-green-600", purple: "bg-purple-600",
  };

  if (!mounted) return null;
  if (isPageLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-zinc-500" size={32}/></div>;

  return (
    <div className="min-h-screen font-sans selection:bg-amber-500/30 bg-black text-white">
      <div className="max-w-7xl mx-auto p-6 md:p-10 pb-32">

        {/* HEADER DINAMIS */}
        <div className="mb-12 animate-in fade-in duration-700">
            <h1 className="text-4xl font-black tracking-tight mb-2">{t.title}</h1>
            <p className="text-zinc-500 text-lg">{t.subtitle}</p>
        </div>

        {/* MENU TAB DINAMIS */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-2 no-scrollbar border-b border-zinc-800">
           <TabButton active={activeTab === "general"} onClick={() => setActiveTab("general")} icon={LayoutGrid} label={t.tabs.general} />
           <TabButton active={activeTab === "routing"} onClick={() => setActiveTab("routing")} icon={Zap} label={t.tabs.routing} />
           <TabButton active={activeTab === "notifications"} onClick={() => setActiveTab("notifications")} icon={Bell} label={t.tabs.notif} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in slide-in-from-bottom-8 duration-700">
            
            <div className="lg:col-span-2 space-y-8">
              {activeTab === "general" && (
                  <div className="border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-sm bg-zinc-900/30">
                      
                      {/* PREVIEW MINI */}
                      <div className="mb-10 bg-black rounded-3xl p-6 border border-zinc-800 flex items-center gap-6">
                          <div className="hidden md:block"><Smartphone size={140} className="text-zinc-700" strokeWidth={1}/></div>
                          <div>
                              <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-2">{t.preview_title}</h3>
                              <p className="text-sm text-zinc-500 mb-4">{t.preview_desc}</p>
                              <div className="bg-white text-black p-4 rounded-xl w-64 shadow-lg relative overflow-hidden">
                                  <div className={`absolute top-0 left-0 w-full h-2 ${colorMap[settings.brandColor]} transition-colors duration-500`}></div>
                                  <div className="mt-2 text-center">
                                      <h4 className="font-bold text-lg">{t.preview_card_title}</h4>
                                      <p className="text-xs text-zinc-500 mb-3">{t.preview_card_ask}</p>
                                      <div className="flex justify-center gap-1 text-zinc-300">
                                          {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" className="text-zinc-300"/>)}
                                      </div>
                                      <button className={`mt-4 w-full py-2 rounded-lg text-white text-xs font-bold ${colorMap[settings.brandColor]} transition-colors duration-500`}>
                                          {t.preview_btn}
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* BRAND COLOR */}
                      <div className="mb-10">
                          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Palette className="text-blue-500" size={24}/> {t.brand_title}</h2>
                          <p className="text-zinc-500 text-sm mb-4">{t.brand_desc}</p>
                          <div className="flex flex-wrap gap-4">
                              {[
                                { id: 'amber', bg: 'bg-amber-500' }, { id: 'blue', bg: 'bg-blue-600' },
                                { id: 'red', bg: 'bg-red-600' }, { id: 'green', bg: 'bg-green-600' }, { id: 'purple', bg: 'bg-purple-600' },
                              ].map((color) => (
                                <button key={color.id} onClick={() => setSettings({...settings, brandColor: color.id})} className={`group relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${color.bg} ${settings.brandColor === color.id ? 'ring-4 ring-white scale-110' : 'hover:scale-105 opacity-50 hover:opacity-100'}`}>
                                    {settings.brandColor === color.id && <CheckCircle2 className="text-white" size={24}/>}
                                </button>
                              ))}
                          </div>
                      </div>

                      <hr className="border-zinc-800 my-8"/>

                      {/* BAHASA */}
                      <div className="mb-10">
                          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Globe className="text-green-500" size={24}/> {t.lang_title}</h2>
                          <div className="grid grid-cols-2 gap-4">
                              <button onClick={() => setSettings({...settings, language: 'id'})} className={`p-4 rounded-xl border-2 text-left transition-all ${settings.language === 'id' ? 'border-zinc-600 bg-zinc-800' : 'border-zinc-800 hover:border-zinc-700'}`}>
                                  <div className="font-bold text-lg text-white">🇮🇩 Indonesia</div>
                                  <div className="text-xs text-zinc-500">{t.lang_desc_id}</div>
                              </button>
                              <button onClick={() => setSettings({...settings, language: 'en'})} className={`p-4 rounded-xl border-2 text-left transition-all ${settings.language === 'en' ? 'border-zinc-600 bg-zinc-800' : 'border-zinc-800 hover:border-zinc-700'}`}>
                                  <div className="font-bold text-lg text-white">🇬🇧 English</div>
                                  <div className="text-xs text-zinc-500">{t.lang_desc_en}</div>
                              </button>
                          </div>
                      </div>

                      <div className="pt-10 border-t border-zinc-800">
                          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3"><LogOut className="text-red-500" size={24}/> {t.logout_title}</h2>
                          <p className="text-zinc-500 text-sm mb-6">{t.logout_desc}</p>
                          <button onClick={handleLogout} disabled={isLoggingOut} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold py-4 rounded-2xl transition flex items-center justify-center gap-3 active:scale-95 group">
                              {isLoggingOut ? <Loader2 className="animate-spin" size={20}/> : <LogOut size={20} className="group-hover:-translate-x-1 transition"/>}
                              {isLoggingOut ? "..." : t.btn_logout}
                          </button>
                      </div>
                  </div>
              )}
              
              {activeTab === "routing" && (
                  <div className="border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-sm bg-zinc-900/30">
                      <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-bold flex items-center gap-3"><Zap className="text-amber-500" size={24}/> {t.routing_title}</h2></div>
                      <div className="border border-zinc-800 rounded-3xl p-6 mb-8 bg-black/40">
                          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{t.routing_desc}</p>
                          <div className="flex justify-between items-center rounded-2xl p-2 border border-zinc-800 bg-black">
                              {[1, 2, 3, 4, 5].map((star) => (
                                  <button key={star} onClick={() => setSettings({...settings, minRatingForGoogle: star})} className={`flex-1 py-4 rounded-xl text-sm font-bold transition-all duration-300 ${settings.minRatingForGoogle <= star ? "bg-green-600 text-white shadow-lg shadow-green-900/20" : "bg-transparent text-zinc-600 hover:text-zinc-400"}`}>⭐ {star}+</button>
                              ))}
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === "notifications" && (
                  <div className="border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-sm bg-zinc-900/30">
                      <div className="mb-8 border-b border-zinc-800 pb-6"><h2 className="text-2xl font-bold flex items-center gap-3"><Bell className="text-blue-500" size={24}/> {t.notif_title}</h2></div>
                      <div className="space-y-6">
                          <div className="flex items-center justify-between p-6 border border-zinc-800 rounded-3xl bg-black/40">
                              <div className="flex items-center gap-4"><div className="p-3 rounded-full bg-zinc-800 text-white shadow-sm"><Mail size={20}/></div><div><h4 className="font-bold">{t.notif_email}</h4><p className="text-zinc-500 text-xs">{t.notif_email_desc}</p></div></div>
                              <ToggleSwitch enabled={settings.enableEmailAlert} onChange={() => setSettings({...settings, enableEmailAlert: !settings.enableEmailAlert})} />
                          </div>
                      </div>
                  </div>
              )}

            </div>

            <div className="space-y-6">
              <div className="border border-zinc-800 rounded-[2.5rem] p-8 sticky top-10 bg-black/80 backdrop-blur-md shadow-2xl shadow-black">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">{t.status_title}</h3>
                  <div className="flex items-center gap-4 mb-8"><div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div><p className="text-zinc-400 text-sm">{t.status_unsaved}</p></div>
                  <button onClick={handleSave} disabled={isLoading} className="w-full font-bold py-4 rounded-2xl transition flex items-center justify-center gap-3 active:scale-95 bg-white text-black hover:bg-zinc-200 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                      {isLoading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} {isLoading ? t.btn_saving : t.btn_save}
                  </button>
              </div>
            </div>

        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
    const activeClass = "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-[1.02]";
    const inactiveClass = "bg-black text-zinc-500 border-zinc-800 hover:text-white hover:border-zinc-600";
    return ( <button onClick={onClick} className={`flex items-center gap-3 px-8 py-4 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${active ? activeClass : inactiveClass}`}> <Icon size={18}/> {label} </button> )
}
function ToggleSwitch({ enabled, onChange }: any) {
    return ( <button onClick={onChange} className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${enabled ? "bg-green-500" : "bg-zinc-800"}`}> <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${enabled ? "translate-x-6" : "translate-x-0"}`}></div> </button> )
}