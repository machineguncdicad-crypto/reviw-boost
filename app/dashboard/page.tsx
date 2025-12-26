'use client'

import Image from 'next/image' 
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import CreateModal from './CreateModal' 
// Import Generator QR
import QRCode from "react-qr-code"
// Import Ikon
import { 
  Copy, ExternalLink, Trash2, MapPin, ShoppingBag, 
  MousePointerClick, Link2, QrCode, 
  Settings, User, Star, LogOut, Plus, LayoutDashboard, MessageSquare, Calendar
} from 'lucide-react' 
// Note: Icon X sudah tidak di-import karena dihapus

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [qrData, setQrData] = useState<string | null>(null) 
  const [activeTab, setActiveTab] = useState('overview') 
  const router = useRouter()

  // --- FETCH DATA ---
  const fetchAllData = async (userId: string) => {
    // 1. Ambil Data Toko
    const { data: campData } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (campData) setCampaigns(campData)

    // 2. Ambil Data Review Masuk
    if (campData && campData.length > 0) {
        const campaignIds = campData.map(c => c.id)
        const { data: feedData } = await supabase
            .from('feedbacks')
            .select('*, campaigns(brand_name)') 
            .in('campaign_id', campaignIds)
            .order('created_at', { ascending: false })
        
        if (feedData) setFeedbacks(feedData)
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        fetchAllData(user.id)
      }
    }
    checkUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Link tersalin!')
  }

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Hapus link ini permanen?')) return;
    const { error } = await supabase.from('campaigns').delete().eq('id', id)
    if (!error) setCampaigns(campaigns.filter(c => c.id !== id))
  }

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('Hapus pesan ini?')) return;
    const { error } = await supabase.from('feedbacks').delete().eq('id', id)
    if (!error) setFeedbacks(feedbacks.filter(f => f.id !== id))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    })
  }

  if (!user) return <div className="min-h-screen bg-black flex items-center justify-center text-yellow-500 font-mono text-xs tracking-widest animate-pulse">LOADING SYSTEM...</div>

  return (
    <div className="min-h-screen bg-black text-white flex font-sans antialiased selection:bg-yellow-500/30 overflow-hidden relative">
      
      {/* MODAL BUAT LINK BARU */}
      <CreateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchAllData(user.id)}
        userId={user.id}
      />

      {/* MODAL TAMPILKAN QR CODE (CLEAN VERSION: TANPA TOMBOL X) */}
      {qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
            {/* Padding dikembalikan normal (p-8) karena tidak ada X yang mengganggu */}
            <div className="bg-zinc-900 border border-yellow-500 rounded-3xl p-8 max-w-sm w-full text-center relative shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                
                {/* JUDUL QR */}
                <h3 className="text-xl font-black text-white mb-1 tracking-wide">QR CODE TOKO</h3>
                <p className="text-zinc-500 text-xs mb-8 uppercase tracking-widest">Scan untuk Review</p>
                
                {/* QR CODE */}
                <div className="bg-white p-4 rounded-2xl mb-6 mx-auto w-fit shadow-xl flex justify-center items-center">
                    <QRCode value={qrData} size={200} />
                </div>

                {/* LINK TEXT */}
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 mb-6">
                    <p className="text-yellow-500 font-mono text-[10px] break-all">{qrData}</p>
                </div>
                
                {/* TOMBOL TUTUP (SATU-SATUNYA CARA KELUAR) */}
                <button onClick={() => setQrData(null)} className="w-full py-4 rounded-xl bg-transparent border border-yellow-500 text-yellow-500 font-bold text-xs uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all shadow-[0_0_15px_rgba(234,179,8,0.1)] cursor-pointer">
                    Tutup / Selesai
                </button>
            </div>
        </div>
      )}

      {/* === SIDEBAR === */}
      <aside className="w-72 border-r border-zinc-800 p-6 flex flex-col justify-between bg-zinc-950 hidden lg:flex z-20 relative">
        <div>
          <div className="mb-12 px-2">
            <Image src="/reviewboost.png" alt="ReviewBoost" width={140} height={40} className="object-contain opacity-100" priority />
          </div>
          
          <nav className="space-y-3">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 text-xs font-bold uppercase tracking-wider ${activeTab === 'overview' ? 'bg-yellow-500/10 border border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'}`}>
              <LayoutDashboard size={18} /> <span>Ringkasan</span>
            </button>
            <button onClick={() => setActiveTab('reviews')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 text-xs font-bold uppercase tracking-wider ${activeTab === 'reviews' ? 'bg-yellow-500/10 border border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'}`}>
              <div className="relative"><Star size={18} className={activeTab === 'reviews' ? 'text-yellow-500' : 'text-zinc-500'} />{feedbacks.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}</div>
              <span>Inbox Review</span>
            </button>
            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 text-xs font-bold uppercase tracking-wider ${activeTab === 'profile' ? 'bg-yellow-500/10 border border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'}`}>
              <User size={18} className="group-hover:text-yellow-500 transition-colors" /> <span>Profil</span>
            </button>
          </nav>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-3 text-zinc-600 hover:text-red-500 text-[10px] font-bold px-4 py-3 transition-colors border-t border-zinc-800 pt-6 uppercase tracking-[0.2em]">
          <LogOut size={14} /> Log Out
        </button>
      </aside>

      {/* === MAIN CONTENT === */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative z-10 scrollbar-hide bg-black">
        <header className="mb-12 flex justify-between items-end border-b border-zinc-800 pb-8">
          <div>
            <h2 className="text-4xl font-thin text-white mb-2">Halo, <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 drop-shadow-sm pl-1">FOUNDER</span></h2>
            <p className="text-zinc-500 text-[10px] font-bold tracking-[0.3em] uppercase flex items-center gap-2">SYSTEM STATUS: ONLINE <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_green]"></span></p>
          </div>
          {activeTab === 'overview' && (
            <button onClick={() => setIsModalOpen(true)} className="px-8 py-3 bg-gradient-to-b from-yellow-400 to-yellow-600 text-black text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform rounded shadow-[0_0_20px_rgba(234,179,8,0.4)]"> + LINK BARU</button>
          )}
        </header>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[ { label: 'ASET DIGITAL', val: campaigns.length, Icon: Link2 }, { label: 'TOTAL KLIK', val: campaigns.reduce((acc, curr) => acc + (curr.total_clicks || 0), 0), Icon: MousePointerClick }, { label: 'TOTAL TRAFFIC', val: campaigns.reduce((acc, curr) => acc + (curr.total_visits || 0), 0), Icon: QrCode } ].map((stat, i) => (
                <div key={i} className="group bg-zinc-950 border border-zinc-800 hover:border-yellow-500 rounded-xl p-8 flex items-center justify-between transition-all duration-300 shadow-lg relative overflow-hidden">
                  <div><p className="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p><span className="text-5xl font-thin text-white tracking-tighter">{stat.val}</span></div>
                  <div className="text-zinc-700 group-hover:text-yellow-500 transition-colors duration-300 p-4 border border-zinc-800 rounded-xl group-hover:border-yellow-500 bg-black"><stat.Icon size={32} strokeWidth={1.5} /></div>
                </div>
              ))}
            </div>
            {campaigns.length === 0 ? (
              <div className="border-2 border-dashed border-yellow-500/30 rounded-xl p-20 text-center bg-yellow-500/5"><h3 className="text-lg font-bold text-yellow-500 mb-2 tracking-wide">DASHBOARD KOSONG</h3><button onClick={() => setIsModalOpen(true)} className="text-white hover:text-yellow-500 text-xs font-bold uppercase tracking-widest underline underline-offset-4 decoration-yellow-500">+ Buat Link Pertama</button></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {campaigns.map((camp) => (
                  <div key={camp.id} className="group bg-zinc-950 border border-zinc-800 hover:border-yellow-500 rounded-xl p-6 transition-all hover:-translate-y-1 relative shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-6"> 
                        <div className={`p-3 rounded-md border ${camp.review_platform === 'google' ? 'border-blue-900 bg-blue-900/10 text-blue-400' : 'border-orange-900 bg-orange-900/10 text-orange-400'}`}>{camp.review_platform === 'google' ? <MapPin size={20} /> : <ShoppingBag size={20} />}</div>
                        <div><h4 className="font-bold text-white text-base tracking-wide group-hover:text-yellow-500 transition-colors">{camp.brand_name}</h4><p className="text-[9px] text-zinc-500 uppercase font-black tracking-[0.15em]">{camp.review_platform}</p></div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_10px_#EAB308] animate-pulse"></div>
                    </div>
                    <div className="bg-black rounded-md p-4 border border-zinc-800 mb-6 flex items-center justify-between group-hover:border-yellow-500/50 transition-colors"><span className="text-zinc-500 text-xs font-mono truncate max-w-[180px]">reviewboost.id/<span className="text-yellow-500">{camp.slug}</span></span><button onClick={() => copyToClipboard(`https://reviewboost.id/${camp.slug}`)} className="text-zinc-600 hover:text-white transition-colors"><Copy size={14} /></button></div>
                    <div className="flex gap-3 border-t border-zinc-800 pt-4">
                      <button onClick={() => window.open(`http://localhost:3000/${camp.slug}`, '_blank')} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-md bg-zinc-900 hover:bg-yellow-500 hover:text-black text-zinc-400 text-[10px] font-bold uppercase tracking-wider transition-all"><ExternalLink size={14} /> Lihat</button>
                      <button onClick={() => setQrData(`https://reviewboost.id/${camp.slug}`)} className="p-3 rounded-md bg-zinc-900 hover:bg-yellow-500 hover:text-black text-zinc-500 transition-colors" title="Lihat QR Code"><QrCode size={16} /></button>
                      <button onClick={() => handleDeleteCampaign(camp.id)} className="p-3 rounded-md bg-zinc-900 hover:bg-red-900/30 text-zinc-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* INBOX TAB */}
        {activeTab === 'reviews' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {feedbacks.length === 0 ? (
                    <div className="text-center py-24 border border-dashed border-zinc-800 rounded-xl bg-zinc-950">
                        <MessageSquare size={40} className="mx-auto text-zinc-800 mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2 tracking-widest uppercase">Inbox Bersih</h3>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {feedbacks.map((fb) => (
                            <div key={fb.id} className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl flex flex-col md:flex-row gap-6 hover:border-yellow-500 transition-all shadow-lg group">
                                <div className="md:w-48 shrink-0 border-b md:border-b-0 md:border-r border-zinc-800 pb-4 md:pb-0 md:pr-4 flex flex-col justify-center">
                                    <div className="flex gap-1 text-yellow-500 mb-3">{[...Array(fb.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}{[...Array(5 - fb.rating)].map((_, i) => <Star key={i} size={14} className="text-zinc-800" fill="#27272a" />)}</div>
                                    <p className="text-xs font-bold text-white mb-1 truncate tracking-wide">{fb.campaigns?.brand_name}</p>
                                    <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase font-bold tracking-widest"><Calendar size={10} /> {formatDate(fb.created_at)}</div>
                                </div>
                                <div className="flex-1">
                                    <div className="bg-black p-5 rounded-md border border-zinc-800 grid grid-cols-[50px_1fr] gap-2 items-start">
                                        <span className="text-6xl text-yellow-500/20 font-serif leading-none mt-[-10px]">“</span>
                                        <p className="text-zinc-300 text-sm leading-relaxed italic pt-2">{fb.comment}</p>
                                    </div>
                                </div>
                                <div className="flex items-center"><button onClick={() => handleDeleteFeedback(fb.id)} className="p-3 rounded-md hover:bg-red-900/20 text-zinc-600 hover:text-red-500 transition-colors border border-transparent hover:border-red-900/50"><Trash2 size={18} /></button></div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
        )}
        
        {/* PROFIL TAB */}
        {activeTab === 'profile' && (
             <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 rounded-full border-2 border-yellow-500 p-1 mb-6 shadow-[0_0_30px_-10px_#EAB308]"><div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center"><User size={40} className="text-yellow-500" /></div></div>
                <h2 className="text-xl font-bold text-white tracking-widest uppercase mb-2">FOUNDER ACCOUNT</h2>
                <p className="text-yellow-500 font-mono text-sm mb-8">{user.email}</p>
                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                     <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl text-center"><span className="text-3xl font-thin text-white block mb-1">{campaigns.length}</span><span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Toko Aktif</span></div>
                     <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl text-center"><span className="text-3xl font-thin text-white block mb-1">{feedbacks.length}</span><span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Inbox</span></div>
                </div>
             </div>
        )}
      </main>
    </div>
  )
}