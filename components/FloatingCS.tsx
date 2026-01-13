"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

export default function FloatingCS() {
  // --- KONFIGURASI ---
  // Ganti nomor ini pake nomor WA lu (Format: 62...)
  const whatsappNumber = "6281224267299"; 
  const adminName = "CS ReviewBoost";
  // -------------------

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Halo Kak! 👋 Ada yang bisa dibantu soal ReviewBoost?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll ke bawah tiap ada chat baru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    
    // 1. Tampilin Chat User
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    // 2. Bot "Pura-pura Mikir" selama 1.5 detik
    setTimeout(() => {
      setIsTyping(false);
      
      // 3. Bot Jawab Template
      const reply = "Oke kak, pertanyaan ini akan dijawab langsung oleh Admin kami. Lanjut di WhatsApp ya biar fast respon! 👇";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

      // 4. Otomatis Buka WhatsApp dengan pesan user tadi
      setTimeout(() => {
        const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(userMsg)}`;
        window.open(waLink, '_blank');
      }, 1000); // Jeda 1 detik setelah bot jawab
      
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
      
      {/* --- JENDELA CHAT (MUNCUL PAS DIKLIK) --- */}
      {isOpen && (
        <div className="mb-4 w-[320px] md:w-[350px] h-[450px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header Chat */}
          <div className="bg-zinc-950 p-4 flex justify-between items-center text-white border-b border-zinc-800">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                        <Bot size={20} className="text-black"/>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-950"></div>
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm">{adminName}</span>
                    <span className="text-[10px] text-zinc-400">Online 24 Jam</span>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-zinc-300 transition">
                <X size={20}/>
            </button>
          </div>

          {/* Area Chat Bubble */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-black">
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
            
            {/* Animasi Typing (Pura-pura mikir) */}
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

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
            <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ketik pertanyaan..."
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
        
        {/* Notif Badge Merah (Biar user penasaran klik) */}
        {!isOpen && (
             <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

    </div>
  );
}