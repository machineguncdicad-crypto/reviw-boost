'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Star, MapPin, Loader2, MessageSquare, AlertCircle, ChevronRight, CheckCircle2, ShoppingBag } from 'lucide-react'
import { useParams } from 'next/navigation'
import Image from 'next/image'

export default function ReviewPage() {
  const params = useParams()
  const slug = params.slug
  
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false) // Loading pas kirim curhat
  const [rating, setRating] = useState(0)
  const [step, setStep] = useState('rating') // rating | feedback | redirect | finish
  const [feedback, setFeedback] = useState('')

  // 1. FETCH DATA KAMPANYE
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!slug) return

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('slug', slug)
        .single()

      if (data) {
        setCampaign(data)
        // Hitung VIEW (Total Scan/Dilihat)
        await supabase.from('campaigns').update({ total_visits: (data.total_visits || 0) + 1 }).eq('id', data.id)
      }
      setLoading(false)
    }

    fetchCampaign()
  }, [slug])

  // 2. LOGIKA RATING (SARINGAN AWAL)
  const handleRating = async (star: number) => {
    setRating(star)
    
    if (star >= 4) {
      // === JALUR VIP (BINTANG 4-5) ===
      setStep('redirect')
      
      // Hitung CONVERSION (Total Klik/Puas)
      if (campaign) {
        await supabase.from('campaigns').update({ total_clicks: (campaign.total_clicks || 0) + 1 }).eq('id', campaign.id)
        
        setTimeout(() => {
          window.location.href = campaign.original_link
        }, 1500)
      }

    } else {
      // === JALUR CURHAT (BINTANG 1-3) ===
      // Jangan hitung klik, suruh isi form aja
      setStep('feedback')
    }
  }

  // 3. LOGIKA KIRIM FEEDBACK (DATABASE SAVER)
  const submitFeedback = async () => {
    if (!feedback.trim()) return; // Cegah kirim kosong
    setSubmitting(true)

    // SIMPAN KE SUPABASE (Tabel Feedbacks)
    const { error } = await supabase.from('feedbacks').insert({
      campaign_id: campaign.id, // Supaya tau ini komplain buat toko siapa
      rating: rating,
      comment: feedback,
      status: 'unread'
    })

    if (error) {
      alert('Gagal mengirim masukan. Koneksi internetmu aman?')
      console.error(error)
      setSubmitting(false)
    } else {
      // SUKSES TERKIRIM
      setStep('finish')
      setSubmitting(false)
    }
  }

  // LOADING STATE (AWAL)
  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="animate-spin text-yellow-500" size={32} />
    </div>
  )

  // 404 STATE (LINK SALAH)
  if (!campaign) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-8 text-center">
      <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
        <AlertCircle size={32} className="text-zinc-600" />
      </div>
      <h1 className="text-2xl font-bold mb-2 tracking-tight">Toko Tidak Ditemukan</h1>
      <p className="text-zinc-500 text-sm">Link yang Anda tuju mungkin sudah tidak aktif.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-yellow-500/30">
      
      {/* Background Mahal */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-600/5 rounded-full blur-[120px]" />

      <div className="max-w-md w-full bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 shadow-2xl relative z-10 text-center backdrop-blur-xl">
        
        {/* === STEP 1: RATING === */}
        {step === 'rating' && (
          <div className="animate-in fade-in zoom-in duration-300">
            {/* Logo Platform */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)] ${campaign.review_platform === 'google' ? 'bg-blue-900/20 text-blue-500' : 'bg-orange-900/20 text-orange-500'}`}>
               {campaign.review_platform === 'google' ? <MapPin size={32} /> : <ShoppingBag size={32} />}
            </div>
            
            <h1 className="text-sm font-medium text-zinc-400 mb-2 uppercase tracking-widest">Beri Rating Untuk</h1>
            <h2 className="text-3xl text-white font-bold mb-10 tracking-tight">{campaign.brand_name}</h2>

            <div className="flex justify-center gap-2 mb-10">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => setRating(star)}
                  onMouseLeave={() => setRating(0)}
                  className="group focus:outline-none transition-transform hover:scale-110 active:scale-95 p-1"
                >
                  <Star 
                    size={42} 
                    strokeWidth={1}
                    className={`${rating >= star ? 'fill-yellow-500 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'text-zinc-700 fill-zinc-900/50'} transition-all duration-200`}
                  />
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">Sentuh Bintang Untuk Menilai</p>
          </div>
        )}

        {/* === STEP 2: REDIRECT (SUCCESS VIP) === */}
        {step === 'redirect' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-4">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-[0_0_30px_-10px_rgba(34,197,94,0.3)]">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Luar Biasa!</h2>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-[80%] mx-auto">
              Terima kasih atas apresiasinya! Kami akan mengarahkan Anda ke halaman ulasan resmi.
            </p>
            <div className="flex items-center justify-center gap-3 text-yellow-500 text-xs font-bold uppercase tracking-widest bg-yellow-500/5 py-4 px-6 rounded-full border border-yellow-500/10">
              <Loader2 className="animate-spin" size={16} /> 
              <span>Membuka {campaign.review_platform}...</span>
            </div>
          </div>
        )}

        {/* === STEP 3: FEEDBACK FORM (HATERS VAULT) === */}
        {step === 'feedback' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-500">
                <MessageSquare size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Ada Masalah?</h2>
                <p className="text-xs text-zinc-500">Ceritakan agar kami bisa memperbaikinya.</p>
              </div>
            </div>
            
            <label className="text-[10px] font-bold text-zinc-500 uppercase mb-3 block tracking-wider">Pesan Anda</label>
            <textarea 
              className="w-full bg-[#050505] border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 transition-all h-32 mb-6 resize-none placeholder-zinc-800 leading-relaxed"
              placeholder="Contoh: Pelayanannya agak lambat tadi siang..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              autoFocus
            />
            
            <button 
              onClick={submitFeedback}
              disabled={submitting || !feedback.trim()}
              className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <> <Loader2 className="animate-spin" size={18} /> Mengirim... </>
              ) : (
                <> <span>Kirim Masukan</span> <ChevronRight size={18} className="text-zinc-400 group-hover:text-black transition-colors" /> </>
              )}
            </button>
            <button onClick={() => setStep('rating')} className="w-full mt-4 text-zinc-600 text-xs hover:text-white transition-colors">
              Kembali
            </button>
          </div>
        )}

        {/* === STEP 4: FINISH (HATERS DONE) === */}
        {step === 'finish' && (
          <div className="py-8 animate-in zoom-in duration-300">
             <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-zinc-800 relative">
                <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-xl animate-pulse"/>
                <CheckCircle2 size={40} className="text-white relative z-10" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Terima Kasih</h2>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-[90%] mx-auto">
              Masukan Anda telah kami terima dan akan langsung disampaikan ke manajemen untuk evaluasi.
            </p>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div className="absolute bottom-8 text-center opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
        <Image src="/reviewboost.png" width={90} height={25} alt="ReviewBoost" />
      </div>
    </div>
  )
}