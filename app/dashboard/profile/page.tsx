"use client";

import { useState, useEffect, useRef } from "react"; 
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  User, CreditCard, Shield, Camera, Save, 
  Loader2, KeyRound, MapPin, Store, 
  CheckCircle2, Zap, Crown, Rocket, Building2, EyeOff, 
  Plus, Trash2 // 👈 Tambahan icon buat cabang
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  
  // 📸 1. REF BUAT INPUT FILE
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // === STATUS LANGGANAN ===
  const [currentPlan, setCurrentPlan] = useState("FREE"); 
  const [expiryDate, setExpiryDate] = useState<string | null>(null);

  // STATE DATA USER
  const [formData, setFormData] = useState({
    id: "",
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    bio: "",
    avatarUrl: ""
  });

  // 🔥 STATE CABANG (Default 1 cabang Pusat)
  const [branches, setBranches] = useState<any[]>([
    { name: "Pusat", url: "" }
  ]);

  const [passData, setPassData] = useState({ oldPass: "", newPass: "" });

  // 1. FETCH DATA
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (data) {
            setFormData({
                id: user.id,
                email: user.email || "",
                fullName: data.full_name || "",
                businessName: data.business_name || "",
                phone: data.phone || "",
                bio: data.bio || "",
                avatarUrl: data.avatar_url || ""
            });

            // 🔥 LOGIC LOAD CABANG
            // Kalau kolom 'branches' ada isinya, pake itu.
            // Kalau kosong, ambil dari google_map_url lama (migrasi).
            if (data.branches && Array.isArray(data.branches) && data.branches.length > 0) {
                setBranches(data.branches);
            } else if (data.google_map_url) {
                setBranches([{ name: "Pusat", url: data.google_map_url }]);
            }

            if (data.tier_name) setCurrentPlan(data.tier_name);
            
            if (data.subscription_end_date) {
                const date = new Date(data.subscription_end_date);
                setExpiryDate(date.toLocaleDateString("id-ID", { 
                    day: 'numeric', month: 'long', year: 'numeric' 
                }));
            }
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchUser();
  }, []);

  // LOAD SCRIPT MIDTRANS
  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
    const script = document.createElement('script');
    script.src = snapScript;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); }
  }, []);

  // 📸 LOGIC UPLOAD FOTO
  const handleImageUpload = async (event: any) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', formData.id);

      if (dbError) throw dbError;

      setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
      alert("📸 Foto berhasil diupdate!");

    } catch (error: any) {
      alert("Gagal upload: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔥 LOGIC MANAGEMENT CABANG 🔥
  const handleBranchChange = (index: number, field: string, value: string) => {
    const newBranches = [...branches];
    newBranches[index][field] = value;
    setBranches(newBranches);
  };

  const addBranch = () => {
    // Limit Sesuai Paket
    // FREE/BASIC = 1, PRO = 3, ENTERPRISE = 999
    let limit = 1; 
    if (currentPlan === 'PRO') limit = 3;
    if (currentPlan === 'ENTERPRISE') limit = 999;
    
    if (branches.length >= limit) {
        alert(`❌ Paket ${currentPlan} maksimal ${limit} cabang. Upgrade dulu bro!`);
        return;
    }
    setBranches([...branches, { name: "", url: "" }]);
  };

  const removeBranch = (index: number) => {
    if (branches.length === 1) {
        alert("⚠️ Minimal harus punya 1 lokasi utama!");
        return;
    }
    const newBranches = branches.filter((_, i) => i !== index);
    setBranches(newBranches);
  };

  // SIMPAN PROFIL (UPDATE CABANG JUGA)
  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          business_name: formData.businessName,
          phone: formData.phone,
          bio: formData.bio,
          branches: branches, // 👈 Simpan Array Cabang ke JSON
          updated_at: new Date().toISOString(),
        })
        .eq('id', formData.id);

      if (error) throw error;
      alert("✅ Profil & Cabang berhasil diperbarui!");
    } catch (error: any) {
      alert("❌ Gagal: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // GANTI PASSWORD & UPGRADE (Sama kayak sebelumnya)
  const handlePassChange = (e: any) => setPassData({ ...passData, [e.target.name]: e.target.value });
  
  const handleUpdatePassword = async () => {
    if (!passData.oldPass || !passData.newPass) { alert("⚠️ Isi password dulu!"); return; }
    setIsLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: formData.email, password: passData.oldPass });
      if (signInError) throw new Error("Password Lama SALAH!");
      const { error } = await supabase.auth.updateUser({ password: passData.newPass });
      if (error) throw error;
      alert("🔒 Password diganti!"); setPassData({ oldPass: "", newPass: "" });
    } catch (e: any) { alert(e.message); } finally { setIsLoading(false); }
  };

  const handleUpgrade = async (planName: string) => {
    let price = 0;
    if (planName === "BASIC") price = 99000;
    if (planName === "PRO") price = 149000;
    if (planName === "ENTERPRISE") price = 600000;
    if (price === 0) return;

    try {
        const response = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: planName, price: price })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        if ((window as any).snap) {
            (window as any).snap.pay(data.token, {
                onSuccess: function(){ alert(`🎉 UPGRADE SUKSES!`); window.location.reload(); },
                onPending: function(){ alert("⏳ Menunggu pembayaran..."); },
                onError: function(){ alert("❌ Gagal bayar!"); }
            });
        }
    } catch (err: any) {
        alert("Error: " + err.message);
    }
  };

  if (isFetching) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={32} /></div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30">
      
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

      <div className="max-w-7xl mx-auto p-6 md:p-10 pb-32">

        {/* HEADER SECTION */}
        <div className="relative mb-16 animate-in fade-in duration-700">
            <div className={`h-64 w-full rounded-[2rem] border border-zinc-800 relative overflow-hidden bg-gradient-to-r ${
                currentPlan === 'ENTERPRISE' ? 'from-purple-900 via-black to-zinc-900' : 
                'from-zinc-900 via-zinc-800 to-black'
            }`}>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
            </div>

            <div className="px-8 -mt-20 relative z-10 flex flex-col md:flex-row items-end gap-8">
                <div className="relative group">
                    <div className={`w-40 h-40 rounded-full border-[6px] flex items-center justify-center overflow-hidden shadow-2xl shadow-black/50 ${
                        currentPlan === 'ENTERPRISE' ? 'border-purple-500 bg-zinc-900' : 'border-black bg-zinc-800'
                    }`}>
                        {isUploading ? (
                            <Loader2 className="animate-spin text-amber-500" size={40} />
                        ) : formData.avatarUrl ? (
                            <img src={formData.avatarUrl} className="w-full h-full object-cover"/>
                        ) : (
                            <span className="text-5xl font-bold text-zinc-600 uppercase">
                                {formData.businessName ? formData.businessName[0] : "T"}
                            </span>
                        )}
                    </div>
                    <div onClick={() => !isUploading && fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-[6px] border-transparent">
                        <Camera className="text-white" size={32}/>
                    </div>
                </div>

                <div className="flex-1 mb-2 space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">
                        {formData.businessName || "Nama Toko Anda"}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-zinc-400 font-medium">
                        <span className="text-sm md:text-base">{formData.email}</span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-lg ${
                            currentPlan === 'ENTERPRISE' ? 'bg-purple-500 text-white shadow-purple-500/20' :
                            currentPlan === 'PRO' ? 'bg-amber-500 text-black shadow-amber-500/20' :
                            currentPlan === 'BASIC' ? 'bg-blue-500 text-white shadow-blue-500/20' :
                            'bg-zinc-700 text-zinc-300'
                        }`}>
                            {currentPlan} MEMBER
                        </span>
                    </div>
                </div>

                {activeTab === "general" && (
                    <div className="hidden md:block mb-4">
                        <button onClick={handleSaveProfile} disabled={isLoading} className="bg-white text-black font-bold px-8 py-4 rounded-2xl hover:bg-zinc-200 transition shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-3">
                            {isLoading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                            {isLoading ? "Menyimpan..." : "Simpan Profil"}
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* TABS */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-2 no-scrollbar border-b border-zinc-800/50">
           <TabButton active={activeTab === "general"} onClick={() => setActiveTab("general")} icon={Store} label="Info Toko" />
           <TabButton active={activeTab === "billing"} onClick={() => setActiveTab("billing")} icon={CreditCard} label="Langganan & Paket" />
           <TabButton active={activeTab === "security"} onClick={() => setActiveTab("security")} icon={Shield} label="Keamanan" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           
           {/* KOLOM KIRI */}
           <div className="lg:col-span-2 space-y-8">
              
              {/* TAB 1: GENERAL */}
              {activeTab === "general" && (
                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                          <InputGroup label="Nama Bisnis (Toko)" name="businessName" value={formData.businessName} onChange={handleChange} placeholder="Contoh: Kopi Senja" />
                          <InputGroup label="Nama Owner" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nama Pemilik" />
                          <InputGroup label="Nomor WhatsApp" name="phone" value={formData.phone} onChange={handleChange} placeholder="628..." />
                          <InputGroup label="Link Logo (Manual)" name="avatarUrl" value={formData.avatarUrl} onChange={handleChange} placeholder="https://..." />
                          
                          {/* 🔥 FORM CABANG DINAMIS 🔥 */}
                          <div className="md:col-span-2 mt-4">
                              <div className="flex items-center justify-between mb-4">
                                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                      <MapPin size={12}/> Link Google Maps Cabang ({branches.length})
                                  </label>
                                  <button 
                                    onClick={addBranch}
                                    type="button"
                                    className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                                  >
                                    <Plus size={12}/> Tambah Cabang
                                  </button>
                              </div>

                              <div className="space-y-3">
                                  {branches.map((branch, index) => (
                                      <div key={index} className="flex gap-3 animate-in slide-in-from-left-2 fade-in duration-300">
                                          <div className="w-1/3">
                                              <input 
                                                type="text" 
                                                placeholder="Nama Cabang (ex: Pusat)"
                                                value={branch.name}
                                                onChange={(e) => handleBranchChange(index, "name", e.target.value)}
                                                className="w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50"
                                              />
                                          </div>
                                          <div className="flex-1">
                                              <input 
                                                type="text" 
                                                placeholder="Link Maps: https://goo.gl/maps/..."
                                                value={branch.url}
                                                onChange={(e) => handleBranchChange(index, "url", e.target.value)}
                                                className="w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50"
                                              />
                                          </div>
                                          <button 
                                            onClick={() => removeBranch(index)}
                                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl px-3 flex items-center justify-center transition"
                                          >
                                              <Trash2 size={16}/>
                                          </button>
                                      </div>
                                  ))}
                              </div>
                              <p className="text-[10px] text-zinc-600 mt-2 ml-1">
                                  *Limit Cabang: <strong>Free (1)</strong>, <strong>Pro (3)</strong>, <strong>Enterprise (∞)</strong>
                              </p>
                          </div>
                          {/* 🔥 END FORM CABANG 🔥 */}

                      </div>
                      
                      <div className="mt-8">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 block">Bio / Deskripsi Singkat</label>
                          <textarea 
                              name="bio" value={formData.bio} onChange={handleChange}
                              className="w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-2xl p-6 h-32"
                              placeholder="Deskripsikan tokomu..." 
                          ></textarea>
                      </div>

                      <div className="mt-8 md:hidden">
                          <button onClick={handleSaveProfile} disabled={isLoading} className="w-full bg-white text-black font-bold px-6 py-4 rounded-xl hover:bg-zinc-200 transition">
                              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                          </button>
                      </div>
                  </div>
              )}

              {/* TAB 2: BILLING (🚫 FREE PLAN ILANG) */}
              {activeTab === "billing" && (
                  <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* 1. BASIC */}
                        <div className={`border rounded-[2.5rem] p-6 transition group ${currentPlan === 'BASIC' ? 'bg-blue-900/20 border-blue-500 ring-1 ring-blue-500' : 'bg-zinc-900/40 border-zinc-800 hover:border-blue-500/30'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div><h3 className="text-lg font-black text-white flex items-center gap-2"><Rocket size={18} className="text-blue-500"/> BASIC</h3></div>
                                <div className="text-right"><span className="text-xl font-bold text-white">Rp 99rb</span></div>
                            </div>
                            <ul className="space-y-2 mb-6 text-xs text-zinc-300">
                                <li className="flex gap-2"><CheckCircle2 size={14} className="text-blue-500 shrink-0"/> 1 Toko</li>
                                <li className="flex gap-2"><CheckCircle2 size={14} className="text-blue-500 shrink-0"/> 100 Review / bulan</li>
                                <li className="flex gap-2 font-bold text-white bg-blue-500/10 px-2 py-1 rounded w-fit"><CheckCircle2 size={14} className="text-blue-500 shrink-0"/> Buka Sensor Komplain</li>
                            </ul>
                            {currentPlan === 'BASIC' ? <button disabled className="w-full py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl cursor-not-allowed">Paket Aktif</button> : <button onClick={() => handleUpgrade("BASIC")} className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm rounded-xl transition border border-zinc-700">Pilih Basic</button>}
                        </div>

                        {/* 2. PRO */}
                        <div className={`border rounded-[2.5rem] p-6 relative overflow-hidden group transition ${currentPlan === 'PRO' ? 'bg-amber-900/20 border-amber-500 ring-1 ring-amber-500' : 'bg-zinc-900/60 border-amber-500/50'}`}>
                            <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Rekomendasi</div>
                            <div className="flex justify-between items-start mb-4">
                                <div><h3 className="text-lg font-black text-white flex items-center gap-2"><Zap size={18} className="text-amber-500 fill-amber-500"/> PRO</h3></div>
                                <div className="text-right"><span className="text-2xl font-bold text-amber-500">Rp 149rb</span></div>
                            </div>
                            <ul className="space-y-2 mb-6 text-xs text-zinc-200">
                                <li className="flex gap-2"><CheckCircle2 size={14} className="text-amber-500 shrink-0"/> <strong>3 Toko</strong> Cabang</li>
                                <li className="flex gap-2"><CheckCircle2 size={14} className="text-amber-500 shrink-0"/> <strong>500 Review</strong> / bulan</li>
                                <li className="flex gap-2"><CheckCircle2 size={14} className="text-amber-500 shrink-0"/> Hapus Branding</li>
                                <li className="flex gap-2"><CheckCircle2 size={14} className="text-amber-500 shrink-0"/> Buka Sensor Komplain</li>
                            </ul>
                            {currentPlan === 'PRO' ? <button disabled className="w-full py-2.5 bg-amber-600 text-black font-bold text-sm rounded-xl cursor-not-allowed">Paket Aktif</button> : <button onClick={() => handleUpgrade("PRO")} className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/20">Upgrade ke PRO 🚀</button>}
                        </div>

                        {/* 3. ENTERPRISE */}
                        <div className={`border rounded-[2.5rem] p-6 group transition duration-300 md:col-span-2 ${currentPlan === 'ENTERPRISE' ? 'bg-purple-900/20 border-purple-500 ring-1 ring-purple-500' : 'bg-gradient-to-br from-zinc-900 to-black border-zinc-800 hover:border-purple-500/50'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div><h3 className="text-lg font-black text-white flex items-center gap-2"><Building2 size={18} className="text-purple-500"/> ENTERPRISE</h3></div>
                                <div className="text-right"><span className="text-xl font-bold text-white">Rp 600rb</span></div>
                            </div>
                            <ul className="space-y-2 mb-6 text-xs text-zinc-300 grid grid-cols-2">
                                <li className="flex gap-2"><Crown size={14} className="text-purple-500 shrink-0"/> <strong>UNLIMITED</strong> Toko</li>
                                <li className="flex gap-2"><Crown size={14} className="text-purple-500 shrink-0"/> <strong>UNLIMITED</strong> Review</li>
                                <li className="flex gap-2"><CheckCircle2 size={14} className="text-purple-500 shrink-0"/> Semua Fitur PRO+</li>
                                <li className="flex gap-2"><CheckCircle2 size={14} className="text-purple-500 shrink-0"/> VIP Support</li>
                            </ul>
                            {currentPlan === 'ENTERPRISE' ? <button disabled className="w-full py-2.5 bg-purple-600 text-white font-bold text-sm rounded-xl cursor-not-allowed">Paket Aktif (Sultan 👑)</button> : <button onClick={() => handleUpgrade("ENTERPRISE")} className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm rounded-xl transition border border-zinc-700">Pilih Enterprise</button>}
                        </div>
                      </div>
                  </div>
              )}

              {/* TAB 3: SECURITY */}
              {activeTab === "security" && (
                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-sm">
                      <h2 className="text-2xl font-bold text-white mb-8">Ganti Password</h2>
                      <div className="space-y-6">
                          <InputGroup label="Password Lama" name="oldPass" value={passData.oldPass} onChange={handlePassChange} type="password" />
                          <InputGroup label="Password Baru" name="newPass" value={passData.newPass} onChange={handlePassChange} type="password" />
                          <button onClick={handleUpdatePassword} disabled={isLoading} className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-bold px-8 py-4 rounded-2xl transition flex items-center justify-center gap-3">
                              {isLoading ? <Loader2 className="animate-spin" size={20}/> : <KeyRound size={20}/>} Ganti Password
                          </button>
                      </div>
                  </div>
              )}

           </div>

           {/* KOLOM KANAN */}
           <div className="space-y-6">
              <div className={`border rounded-[2.5rem] p-8 sticky top-10 ${
                  currentPlan === 'ENTERPRISE' ? 'bg-purple-950/20 border-purple-500/50' : 
                  'bg-black border-zinc-800'
              }`}>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-8">Langganan Aktif</h3>
                  <div className="flex items-center gap-5 mb-10">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-black border shadow-[0_0_30px_rgba(255,255,255,0.1)] ${
                          currentPlan === 'ENTERPRISE' ? 'bg-gradient-to-br from-purple-500 to-purple-700 border-purple-400' :
                          currentPlan === 'PRO' ? 'bg-gradient-to-br from-amber-500 to-amber-700 border-amber-400' :
                          'bg-zinc-800 border-zinc-600 text-white'
                      }`}>
                          {currentPlan === 'ENTERPRISE' ? <Crown size={32} className="text-white"/> : <Shield size={32} />}
                      </div>
                      <div>
                          <h4 className={`font-black text-2xl tracking-tight ${currentPlan === 'ENTERPRISE' ? 'text-purple-400' : 'text-white'}`}>{currentPlan} PLAN</h4>
                          <div className="flex items-center gap-2 mt-2 bg-zinc-900 w-fit px-3 py-1 rounded-full border border-zinc-800">
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                              <p className="text-zinc-400 text-[10px] font-bold uppercase">{expiryDate ? `Exp: ${expiryDate}` : 'Lifetime'}</p>
                          </div>
                      </div>
                  </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}

// SUB COMPONENTS
function TabButton({ active, onClick, icon: Icon, label }: any) {
    return <button onClick={onClick} className={`flex items-center gap-3 px-8 py-4 rounded-full text-sm font-bold transition-all border ${active ? "bg-white text-black scale-105" : "bg-black text-zinc-500 border-zinc-800"}`}><Icon size={18}/> {label}</button>
}
function InputGroup({ label, name, value, onChange, type = "text", placeholder, disabled = false, icon: Icon }: any) {
    return <div className="space-y-3 w-full"><label className="text-[11px] font-bold text-zinc-500 uppercase flex items-center gap-2">{Icon && <Icon size={12}/>} {label}</label><input name={name} type={type} value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} className={`w-full bg-zinc-900/50 border border-zinc-800 text-white rounded-2xl px-6 py-4 focus:outline-none focus:border-amber-500/50 ${disabled ? 'opacity-50' : ''}`} /></div>
}