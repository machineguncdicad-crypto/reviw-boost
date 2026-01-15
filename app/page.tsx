"use client"; // 👈 WAJIB ADA DI PALING ATAS

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
// 🔥 1. IMPORT SUPABASE BIAR BISA CEK LOGIN
import { supabase } from "@/lib/supabase"; 

import { 
  Star, Shield, MessageCircle, BarChart3, 
  CheckCircle2, ArrowRight, Play, Sparkles
} from "lucide-react";

// Pastikan Navbar ada di folder components
import Navbar from "@/components/Navbar"; 

export default function LandingPage() {
  const router = useRouter();

  // 🔥 2. LOGIKA BARU: AUTO-REDIRECT KE DASHBOARD 🔥
  useEffect(() => {
    const checkUser = async () => {
      // Cek apakah user sebenernya udah login (punya sesi)
      const { data: { session } } = await supabase.auth.getSession();
      
      // Kalau udah login, langsung lempar ke Dashboard
      if (session) {
        console.log("User sudah login, redirect ke dashboard...");
        router.replace("/dashboard");
      }

      // Dengerin kalau tiba-tiba login berhasil (misal dari redirect URL tadi)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
             router.replace("/dashboard");
        }
      });

      return () => subscription.unsubscribe();
    };

    checkUser();
  }, [router]);


  // 3️⃣ LOAD SCRIPT MIDTRANS (TETAP SAMA)
  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
    
    const script = document.createElement('script');
    script.src = snapScript;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, []);

  // 4️⃣ FUNGSI BAYAR (TETAP SAMA)
  const handleBuy = async (plan: string, price: number) => {
    try {
        console.log(`Processing buy: ${plan} - ${price}`); 
        
        const response = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan, price })
        });

        const data = await response.json();

        if (!response.ok) {
            if(response.status === 401) {
                alert("Eits, Login dulu ya sebelum upgrade! 🔒");
                router.push('/login');
                return;
            }
            throw new Error(data.error || "Terjadi kesalahan");
        }

        if ((window as any).snap) {
            (window as any).snap.pay(data.token, {
                onSuccess: function(result: any){
                    alert("🎉 PEMBAYARAN BERHASIL!");
                    router.push('/dashboard');
                },
                onPending: function(result: any){
                    alert("⏳ Menunggu pembayaran...");
                },
                onError: function(result: any){
                    alert("❌ Pembayaran gagal!");
                },
                onClose: function(){
                    console.log('Popup ditutup tanpa bayar');
                }
            });
        } else {
            alert("Sistem pembayaran belum siap. Coba refresh halaman.");
        }

    } catch (err: any) {
        console.error(err);
        alert("Gagal memproses transaksi: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30 overflow-x-hidden">
      
      <Navbar /> 

      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-white/10 text-xs font-bold uppercase tracking-widest text-amber-500 mb-8 backdrop-blur-md shadow-lg">
            <Star size={12} className="fill-amber-500" /> #1 Manajer Reputasi
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
            Reputasi Lebih Baik,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">
              Tanpa Ribet.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Sistem pintar yang memisahkan review negatif ke inbox pribadi, 
            dan mendorong pelanggan puas ke Google Maps.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-16">
            <Link href="/register" className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg rounded-2xl hover:scale-105 transition shadow-[0_0_40px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2">
              Mulai Sekarang <ArrowRight size={20}/>
            </Link>
            <Link href="#demo" className="px-8 py-4 bg-zinc-900 text-white border border-zinc-800 font-bold text-lg rounded-2xl hover:bg-zinc-800 transition flex items-center justify-center gap-2">
              <Play size={20} /> Tonton Video
            </Link>
          </div>
        </div>
      </section>

      {/* --- SOCIAL PROOF --- */}
      <section className="py-10 border-y border-white/5 bg-black/50">
          <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-8">
                Dirancang untuk Berbagai Bisnis Modern
              </p>
              
              <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:opacity-100 transition duration-500 cursor-default">
                  <span className="text-xl font-black tracking-widest uppercase" title="Coffee Shop">KopiSenja</span>
                  <span className="text-xl font-black italic" title="F&B">BURGER.CO</span>
                  <span className="text-xl font-black tracking-tighter" title="Barbershop">BarberKing</span>
                  <span className="text-xl font-black font-mono" title="Beauty Salon">BeautyLash</span>
                  <span className="text-xl font-black" title="Laundry Service">LoundryX</span>
              </div>
          </div>
      </section>

      {/* --- VIDEO DEMO --- */}
      <section id="demo" className="py-24 bg-zinc-950 relative overflow-hidden scroll-mt-20">
        <div className="absolute -left-40 top-1/2 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute -right-40 top-1/2 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
           <div className="mb-12">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Video Demo</h2>
              <p className="text-zinc-400">Tonton bagaimana sistem kami bekerja dalam 30 detik.</p>
           </div>
           
           <div className="relative aspect-video w-full bg-zinc-900/50 rounded-[2rem] border border-zinc-800 shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center group cursor-pointer hover:border-amber-500/30 transition duration-500">
              <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-500 transition duration-300 backdrop-blur-sm">
                      <Play size={32} className="ml-1" fill="currentColor"/>
                  </div>
                  <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest group-hover:text-zinc-300 transition">Area Video Demo</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>
           </div>
        </div>
      </section>

      {/* --- FITUR --- */}
      <section id="features" className="py-24 bg-black relative scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Fitur Andalan</h2>
            <p className="text-zinc-400">Teknologi yang bekerja keras untuk bisnis Anda.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard icon={<Shield size={32} className="text-blue-500"/>} title="Filter Cerdas" desc="Review bintang 1-3 kami tahan di inbox pribadi. Cuma bintang 4-5 yang lolos ke Google Maps." />
            <FeatureCard icon={<MessageCircle size={32} className="text-green-500"/>} title="Database WhatsApp" desc="Kumpulkan nomor WA pelanggan secara otomatis dari setiap review yang masuk. Aset mahal!" />
            <FeatureCard icon={<BarChart3 size={32} className="text-purple-500"/>} title="Analitik Real-time" desc="Pantau performa tiap cabang toko Anda. Siapa staf terbaik? Jam berapa paling ramai?" />
          </div>
        </div>
      </section>

      {/* --- HARGA --- */}
      <section id="pricing" className="py-24 border-t border-white/5 relative scroll-mt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-black to-black"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Investasi Cerdas.</h2>
            <p className="text-zinc-400">Pilih paket terbaik untuk pertumbuhan bisnismu.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            <PricingCard 
              title="BASIC" 
              price="Rp 99rb" 
              period="/bulan" 
              desc="UMKM Pemula."
              features={["1 Toko", "100 Review / bulan", "Buka Sensor Inbox", "Bantuan WA Standar"]}
              btnText="Pilih Basic" 
              highlightColor="blue"
              onClick={() => handleBuy("BASIC", 99000)}
            />

            <PricingCard 
              title="PRO" 
              price="Rp 149rb" 
              period="/bulan" 
              desc="Bisnis Tumbuh."
              features={["3 Toko Cabang", "500 Review / bulan", "Hapus Branding", "Ekspor Data Pelanggan", "Bantuan Prioritas"]}
              btnText="Pilih PRO 🔥" 
              active={true} 
              highlightColor="amber" 
              recommended
              onClick={() => handleBuy("PRO", 149000)}
            />

            <PricingCard 
              title="ENTERPRISE" 
              price="Rp 600rb" 
              period="/6 bulan" 
              desc="Franchise & Agency."
              features={["UNLIMITED Toko", "UNLIMITED Review", "Semua Fitur PRO+", "VIP Jalur Khusus", "Integrasi Khusus"]}
              btnText="Hubungi Sales" 
              highlightColor="purple"
              onClick={() => handleBuy("ENTERPRISE", 600000)}
            />

          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-12 rounded-[3rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none"></div>
          
          <h2 className="text-3xl md:text-4xl font-black mb-6">Siap Dominasi Pasar?</h2>
          <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
            Kompetitor Anda mungkin sudah pakai ini. Jangan ketinggalan.
          </p>
          
          <Link href="/register" className="inline-block px-10 py-5 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition shadow-2xl flex items-center gap-2 mx-auto">
             <Sparkles size={20} className="text-amber-500"/> Mulai Sekarang
          </Link>
        </div>
      </section>

      <footer className="py-10 border-t border-white/5 text-center text-zinc-600 text-sm">
        <p>&copy; 2024 ReviewBoost Indonesia. Dibuat untuk Pemenang.</p>
      </footer>

    </div>
  );
}

// --- KOMPONEN FITUR ---
function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-3xl bg-zinc-900/30 border border-white/5 hover:border-amber-500/30 transition group">
      <div className="mb-6 p-4 bg-black rounded-2xl w-fit border border-zinc-800 group-hover:scale-110 transition">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  )
}

// --- KOMPONEN HARGA ---
function PricingCard({ title, price, period, desc, features, btnText, active, highlightColor = "zinc", recommended, onClick }: any) {
  const colors: any = { zinc: "border-zinc-800 hover:border-zinc-700", blue: "border-blue-900/50 hover:border-blue-500", amber: "border-amber-500/50 ring-1 ring-amber-500/50 bg-amber-950/10", purple: "border-purple-900/50 hover:border-purple-500" };
  const btnColors: any = { zinc: "bg-zinc-800 text-white hover:bg-zinc-700", blue: "bg-blue-600 text-white hover:bg-blue-500", amber: "bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20", purple: "bg-purple-600 text-white hover:bg-purple-500" };
  
  return (
    <div className={`p-8 rounded-3xl border bg-zinc-900/20 relative flex flex-col ${colors[highlightColor]} transition-all duration-300 hover:-translate-y-2`}>
      {recommended && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Paling Laris</div>}
      <div className="mb-6">
        <h3 className={`text-lg font-black mb-2 uppercase tracking-wider text-${highlightColor}-500`}>{title}</h3>
        <div className="flex items-baseline gap-1"><span className="text-3xl font-bold text-white">{price}</span>{period && <span className="text-xs text-zinc-500">{period}</span>}</div>
        <p className="text-xs text-zinc-500 mt-2">{desc}</p>
      </div>
      <ul className="space-y-4 mb-8 flex-1">{features.map((f: string, i: number) => (<li key={i} className="flex items-start gap-3 text-sm text-zinc-300"><CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${active ? "text-amber-500" : "text-zinc-600"}`}/>{f}</li>))}</ul>
      
      <button 
        onClick={onClick}
        className={`w-full py-4 rounded-xl font-bold text-sm transition ${btnColors[highlightColor]}`}
      >
        {btnText}
      </button>
    </div>
  )
}