"use client";

import { useState, useEffect } from "react";
import { 
  Download, QrCode, Palette, Image as ImageIcon, 
  Share2, Printer, Check 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function QrGeneratorPage() {
  const [color, setColor] = useState("#f59e0b"); // Default Amber
  const [style, setStyle] = useState("card"); // card | sticker
  const [isDownloading, setIsDownloading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // PRESET WARNA BRANDING
  const brandColors = [
    { name: "Senja", hex: "#f59e0b" },
    { name: "Ocean", hex: "#3b82f6" },
    { name: "Forest", hex: "#22c55e" },
    { name: "Rose", hex: "#e11d48" },
    { name: "Royal", hex: "#7c3aed" },
    { name: "Slate", hex: "#ffffff" }, 
  ];

  // AMBIL USER ID (Biar QR-nya ngarah ke toko yang bener)
  useEffect(() => {
    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  const handleDownload = () => {
    setIsDownloading(true);
    // Simulasi proses generate gambar
    setTimeout(() => {
        setIsDownloading(false);
        alert("QR Code berhasil didownload! (Format .PNG High-Res)");
    }, 2000);
  };

  // URL ASLI TOKO (Nanti QR Code harusnya ngarah ke sini)
  const shopUrl = userId ? `${window.location.origin}/review/${userId}` : "Loading...";

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30">
      
      <div className="max-w-7xl mx-auto p-6 md:p-10 pb-32">
        
        {/* HEADER */}
        <div className="mb-12 animate-in fade-in duration-700">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">QR Code Studio</h1>
            <p className="text-zinc-500 text-lg">Desain materi promosi fisik untuk ditempel di meja pelanggan.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-bottom-8 duration-700">
           
           {/* --- KOLOM KIRI: KONTROL DESAIN --- */}
           <div className="lg:col-span-4 space-y-8">
              
              {/* 1. TIPE DESAIN */}
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-8">
                  <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                      <ImageIcon size={20} className="text-zinc-400"/> Tipe Desain
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                      <button 
                          onClick={() => setStyle("card")}
                          className={`p-4 rounded-2xl border-2 transition-all text-left group ${
                              style === "card" 
                              ? "border-amber-500 bg-amber-500/10" 
                              : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600"
                          }`}
                      >
                          <div className="w-8 h-8 rounded bg-zinc-800 mb-3 group-hover:scale-110 transition border border-zinc-700"></div>
                          <span className={`block font-bold text-sm ${style === "card" ? "text-amber-500" : "text-zinc-400"}`}>Tent Card</span>
                          <span className="text-[10px] text-zinc-600">Buat di Meja</span>
                      </button>

                      <button 
                          onClick={() => setStyle("sticker")}
                          className={`p-4 rounded-2xl border-2 transition-all text-left group ${
                              style === "sticker" 
                              ? "border-amber-500 bg-amber-500/10" 
                              : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600"
                          }`}
                      >
                          <div className="w-8 h-8 rounded-full bg-zinc-800 mb-3 group-hover:scale-110 transition border border-zinc-700"></div>
                          <span className={`block font-bold text-sm ${style === "sticker" ? "text-amber-500" : "text-zinc-400"}`}>Sticker</span>
                          <span className="text-[10px] text-zinc-600">Tempel Kaca</span>
                      </button>
                  </div>
              </div>

              {/* 2. WARNA BRAND */}
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-8">
                  <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                      <Palette size={20} className="text-zinc-400"/> Warna Brand
                  </h3>
                  <div className="flex flex-wrap gap-4">
                      {brandColors.map((c) => (
                          <button
                              key={c.name}
                              onClick={() => setColor(c.hex)}
                              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${
                                  color === c.hex ? "border-white scale-110" : "border-transparent"
                              }`}
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                          >
                              {color === c.hex && <Check size={16} className={c.name === "Slate" ? "text-black" : "text-white"} />}
                          </button>
                      ))}
                  </div>
              </div>

              {/* LINK PREVIEW (BUAT TESTING) */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                 <p className="text-xs text-zinc-500 uppercase font-bold mb-2">Link Review Toko:</p>
                 <code className="block bg-black p-3 rounded-lg text-xs text-zinc-400 break-all border border-zinc-800">
                    {shopUrl}
                 </code>
              </div>

           </div>


           {/* --- KOLOM KANAN: LIVE PREVIEW --- */}
           <div className="lg:col-span-8">
              <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden flex flex-col items-center justify-center min-h-[600px]">
                  
                  {/* Background Grid Pattern */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                  
                  <h3 className="absolute top-8 left-8 text-xs font-bold text-zinc-500 uppercase tracking-widest bg-black px-3 py-1 rounded-full border border-zinc-800 z-10">
                      Live Preview
                  </h3>

                  {/* KONTEN PREVIEW DINAMIS */}
                  <div className="relative z-10 animate-in zoom-in duration-500">
                      
                      {/* TENT CARD STYLE */}
                      {style === "card" && (
                          <div className="w-[300px] md:w-[350px] bg-white rounded-3xl p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] text-center relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-full h-3" style={{ backgroundColor: color }}></div>
                              
                              <h2 className="text-black font-black text-2xl mb-2 mt-4">REVIEW KAMI</h2>
                              <p className="text-zinc-500 text-sm mb-8 px-4">Scan untuk dapat promo & bantu kami jadi lebih baik!</p>
                              
                              <div className="w-48 h-48 bg-black mx-auto rounded-2xl p-2 mb-8 relative group cursor-pointer">
                                  {/* QR MOCKUP (Pakai Icon Dulu) */}
                                  <div className="w-full h-full bg-white rounded-xl flex items-center justify-center overflow-hidden border-4 border-white">
                                      <QrCode size={120} className="text-black"/>
                                  </div>
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                      <div className="bg-black/80 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                                          Scan Me
                                      </div>
                                  </div>
                              </div>

                              <div className="flex items-center justify-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                                  Powered by ReviewBoost
                              </div>
                          </div>
                      )}

                      {/* STICKER STYLE */}
                      {style === "sticker" && (
                          <div className="w-[300px] h-[300px] rounded-full bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center relative overflow-hidden border-[8px] border-white ring-1 ring-zinc-200">
                              <div className="absolute inset-0 opacity-10" style={{ backgroundColor: color }}></div>
                              
                              <div className="relative z-10 text-center">
                                  <h2 className="text-black font-black text-xl mb-1">SCAN ME</h2>
                                  <p className="text-zinc-500 text-[10px] mb-4 font-bold uppercase tracking-widest">Dapatkan Promo</p>
                                  
                                  <div className="bg-white p-2 rounded-xl shadow-sm mb-2">
                                      <QrCode size={100} className="text-black" style={{ color: color }}/>
                                  </div>
                              </div>
                          </div>
                      )}

                  </div>

                  {/* TOMBOL ACTION */}
                  <div className="absolute bottom-8 flex gap-4">
                      <button className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-3 rounded-xl text-sm font-bold border border-zinc-700 transition flex items-center gap-2">
                          <Share2 size={16}/> Share Link
                      </button>
                      <button 
                        className="flex bg-white hover:bg-zinc-200 text-black px-8 py-3 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] transition items-center gap-2" 
                        onClick={handleDownload}
                      >
                          {isDownloading ? <span className="animate-spin">⏳</span> : <Download size={18}/>}
                          {isDownloading ? "Generating..." : "Download PNG"}
                      </button>
                  </div>

              </div>
           </div>

        </div>
      </div>
    </div>
  );
}

// --- COMPONENTS ---
function DownloadButton({ onClick, isLoading }: any) {
    return (
        <button 
            onClick={onClick}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-zinc-200 transition shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 active:scale-95"
        >
            {isLoading ? "Memproses..." : <><Printer size={20}/> Download Siap Cetak</>}
        </button>
    )
}