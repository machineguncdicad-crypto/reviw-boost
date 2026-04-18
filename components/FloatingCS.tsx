"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function FloatingCS() {
  const pathname = usePathname();
  
  // 🔥 NOMOR ADMIN (ReviewBoost) 🔥
  const ADMIN_PHONE = "6281224267199";
  const ADMIN_NAME = "CS ReviewBoost";

  const [targetPhone, setTargetPhone] = useState(ADMIN_PHONE);
  const [targetName, setTargetName] = useState(ADMIN_NAME);
  const [isVisible, setIsVisible] = useState(false); // Default hidden pas loading
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- LOGIKA MULTI-TENANT (Deteksi URL Otomatis) ---
  useEffect(() => {
    const checkRouteAndFetchData = async () => {
       if (!pathname) return;

       // 1. Kalau di halaman SaaS lu -> Munculin CS Admin (Nomor Lu)
       const isAdminRoute = pathname === '/' || 
                            pathname.startsWith('/dashboard') || 
                            pathname.startsWith('/login') || 
                            pathname.startsWith('/register') ||
                            pathname.startsWith('/forgot-password') ||
                            pathname.startsWith('/update-password') ||
                            pathname.startsWith('/terms');

       if (isAdminRoute) {
           setTargetPhone(ADMIN_PHONE);
           setTargetName(ADMIN_NAME);
           setIsVisible(true);
           return;
       }

       // 2. Kalau di halaman Publik Review (/[slug]) -> Cari nomor WA Owner Toko!
       const slug = pathname.replace('/', ''); // Ambil slug dari URL
       if (slug) {
           try {
               // Coba cari di profil owner (Toko Baru)
               const { data: profile } = await supabase.from('profiles').select('phone, business_name').eq('slug', slug).single();
               if (profile && profile.phone) {
                   setTargetPhone(formatPhone(profile.phone));
                   setTargetName(profile.business_name || "CS Toko");
                   setIsVisible(true);
                   return;
               }

               // Fallback: Coba cari di campaigns (Toko Lama)
               const { data: camp } = await supabase.from('campaigns').select('user_id, brand_name').eq('slug', slug).single();
               if (camp) {
                   // Ambil nomor WA dari database profile sang owner
                   const { data: owner } = await supabase.from('profiles').select('phone').eq('id', camp.user_id).single();
                   if (owner && owner.phone) {
                       setTargetPhone(formatPhone(owner.phone));
                       setTargetName(camp.brand_name || "CS Toko");
                       setIsVisible(true);
                       return;
                   }
               }

               // 🛡️ PROTEKSI: Kalau toko gak ngisi nomor WA di profilnya, SEMBUNYIKAN CS-nya! (Biar gak nyasar ke lu)
               setIsVisible(false);

           } catch (error) {
               console.error("Gagal load WA CS:", error);
               setIsVisible(false);
           }
       }
    };

    checkRouteAndFetchData();
  }, [pathname]);

  // Helper bersihin format nomor
  const formatPhone = (phone: string) => {
    let p = phone.replace(/\D/g, '');
    if (p.startsWith('0')) p = '62' + p.slice(1);
    return p;
  };

  // Reset chat pas dibuka pertama kali
  useEffect(() => {
    if (isOpen && messages.length === 0) {
        setMessages([
            { role: 'assistant', content: `Halo! 👋 Selamat datang di ${targetName}. Ada yang bisa kami bantu?` }
        ]);
    }
  }, [isOpen, targetName]);

  // Auto scroll ke bawah tiap ada chat baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      
      const reply = "Baik kak, pesan kakak akan kami alihkan ke WhatsApp Admin agar lebih cepat dibalas ya! 👇";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

      setTimeout(() => {
        const waLink = `https://wa.me/${targetPhone}?text=${encodeURIComponent(userMsg)}`;
        window.open(waLink, '_blank');
      }, 1000); 
      
    }, 1500);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
      
      {/* --- JENDELA CHAT --- */}
      {isOpen && (
        <div className="mb-4 w-[320px] md:w-[350px] h-[450px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          <div className="bg-zinc-950 p-4 flex justify-between items-center text-white border-b border-zinc-800">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                        <Bot size={20} className="text-black"/>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-950"></div>
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm truncate max-w-[150px]">{targetName}</span>
                    <span className="text-[10px] text-zinc-400">Online</span>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-zinc-300 transition">
                <X size={20}/>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-black custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    m.role === 'user' 
                    ? 'bg-amber-500 text-black rounded-tr-none' 
                    : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-tl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                 <div className="bg-white dark:bg-zinc-800 border dark:border-zinc-700 p-3 rounded-2xl rounded-tl-none flex gap-1 shadow-sm items-center h-10">
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-200"></span>
                 </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
            <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tanya sesuatu..."
                className="flex-1 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-white placeholder:text-zinc-500"
            />
            <button 
                onClick={handleSend} 
                disabled={!input.trim()}
                className="bg-zinc-900 dark:bg-white text-white dark:text-black p-2.5 rounded-full hover:opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
            >
                <Send size={16}/>
            </button>
          </div>

        </div>
      )}

      {/* --- TOMBOL FLOAT UTAMA --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center justify-center w-14 h-14 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:scale-110 transition-all duration-300 border-[3px] border-zinc-800 dark:border-zinc-200 relative z-50"
      >
        {isOpen ? <X size={24}/> : <MessageCircle size={26} className="fill-current"/>}
        
        {!isOpen && (
             <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

    </div>
  );
}