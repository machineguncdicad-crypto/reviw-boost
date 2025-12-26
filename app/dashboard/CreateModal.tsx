'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { X, Link as LinkIcon, MapPin, ShoppingBag, Loader2 } from 'lucide-react' 

export default function CreateModal({ isOpen, onClose, onSuccess, userId }: any) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    brand_name: '',
    platform: 'google',
    original_link: ''
  })

  if (!isOpen) return null

  const handleSubmit = async () => {
    // 1. Validasi: Pastikan semua diisi
    if (!formData.brand_name || !formData.original_link) {
      alert('Isi dulu nama brand & link-nya, Bos!')
      return
    }

    setLoading(true)

    // 2. BIKIN SLUG (VERSI ANTI ERROR) 🛡️
    // Rumus: Ubah ke huruf kecil -> Hapus simbol aneh (@, !, .) ganti jadi strip
    const randomCode = Math.random().toString(36).substring(2, 5)
    const cleanName = formData.brand_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const slug = `${cleanName}-${randomCode}`

    // 3. Kirim ke Database Supabase
    const { error } = await supabase.from('campaigns').insert({
      user_id: userId,
      brand_name: formData.brand_name,
      review_platform: formData.platform,
      original_link: formData.original_link,
      slug: slug
    })

    if (error) {
      alert('Gagal buat link: ' + error.message)
    } else {
      alert('🔥 MANTAP! Link berhasil dibuat!')
      setFormData({ brand_name: '', platform: 'google', original_link: '' }) // Reset form
      onSuccess() // Refresh dashboard
      onClose() // Tutup modal
    }
    setLoading(false)
  }

  return (
    // OVERLAY GELAP
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      
      {/* KOTAK MODAL */}
      <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Hiasan Atas */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 to-yellow-400" />

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Buat Link Review
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-4">
          
          {/* 1. Nama Brand */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Nama Brand / Toko</label>
            <input 
              type="text" 
              placeholder="Contoh: Kopi Senja (Cabang Pusat)"
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-all text-sm placeholder:text-zinc-700"
              value={formData.brand_name}
              onChange={(e) => setFormData({...formData, brand_name: e.target.value})}
            />
          </div>

          {/* 2. Platform (Pilihan) */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Platform Review</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setFormData({...formData, platform: 'google'})}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${formData.platform === 'google' ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-black border-white/10 text-zinc-400 hover:bg-white/5'}`}
              >
                <MapPin size={16} /> Google Maps
              </button>
              <button 
                onClick={() => setFormData({...formData, platform: 'shopee'})}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${formData.platform === 'shopee' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-black border-white/10 text-zinc-400 hover:bg-white/5'}`}
              >
                <ShoppingBag size={16} /> Shopee / Olshop
              </button>
            </div>
          </div>

          {/* 3. Link Asli */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Link Tujuan (Maps/Shopee)</label>
            <div className="relative">
              <LinkIcon size={16} className="absolute left-4 top-3.5 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Paste link panjang disini..."
                className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-all text-sm placeholder:text-zinc-700"
                value={formData.original_link}
                onChange={(e) => setFormData({...formData, original_link: e.target.value})}
              />
            </div>
          </div>

        </div>

        {/* Footer Tombol */}
        <div className="p-6 pt-0">
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-yellow-900/20 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <> <Loader2 className="animate-spin" size={18}/> Memproses... </>
            ) : (
              'BUAT LINK SEKARANG ✨'
            )}
          </button>
        </div>

      </div>
    </div>
  )
}