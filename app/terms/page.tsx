export default function TermsPage() {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-sans">
        <div className="max-w-3xl mx-auto px-6 py-16">
  
          <h1 className="text-4xl font-black mb-2">Syarat & Ketentuan</h1>
          <p className="text-zinc-500 text-sm mb-12">Terakhir diperbarui: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
  
          <div className="space-y-10 text-zinc-300 leading-relaxed">
  
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Penerimaan Syarat</h2>
              <p>Dengan mendaftar dan menggunakan ReviewBoost, Anda menyetujui syarat dan ketentuan ini. Jika tidak setuju, harap tidak menggunakan layanan kami.</p>
            </section>
  
            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Layanan</h2>
              <p>ReviewBoost menyediakan platform untuk membantu bisnis mengumpulkan ulasan pelanggan dan mengelola reputasi online. Kami berhak mengubah, menambah, atau menghentikan fitur sewaktu-waktu.</p>
            </section>
  
            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Akun Pengguna</h2>
              <ul className="list-disc list-inside mt-3 space-y-2 text-zinc-400">
                <li>Anda bertanggung jawab menjaga kerahasiaan password akun</li>
                <li>Satu akun hanya boleh digunakan oleh satu entitas bisnis</li>
                <li>Kami berhak menangguhkan akun yang melanggar ketentuan</li>
              </ul>
            </section>
  
            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Pembayaran & Langganan</h2>
              <ul className="list-disc list-inside mt-3 space-y-2 text-zinc-400">
                <li>Free trial berlaku 14 hari sejak registrasi</li>
                <li>Pembayaran diproses melalui Midtrans yang telah tersertifikasi</li>
                <li>Langganan tidak diperpanjang otomatis — Anda harus memperbarui secara manual</li>
                <li>Tidak ada refund untuk pembayaran yang sudah diproses</li>
              </ul>
            </section>
  
            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Larangan Penggunaan</h2>
              <p>Pengguna dilarang:</p>
              <ul className="list-disc list-inside mt-3 space-y-2 text-zinc-400">
                <li>Menggunakan ReviewBoost untuk kegiatan ilegal</li>
                <li>Membuat ulasan palsu atau menyesatkan</li>
                <li>Melakukan spam atau penyalahgunaan platform</li>
                <li>Mencoba meretas atau mengganggu sistem kami</li>
              </ul>
            </section>
  
            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Batasan Tanggung Jawab</h2>
              <p>ReviewBoost tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan layanan. Layanan disediakan "sebagaimana adanya" tanpa garansi.</p>
            </section>
  
            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. Hukum yang Berlaku</h2>
              <p>Syarat ini diatur oleh hukum Republik Indonesia. Sengketa diselesaikan melalui musyawarah atau pengadilan yang berwenang di Indonesia.</p>
            </section>
  
            <section>
              <h2 className="text-xl font-bold text-white mb-3">8. Kontak</h2>
              <p>Pertanyaan terkait syarat ini dapat dikirim ke <span className="text-amber-500">support@reviewboost.id</span></p>
            </section>
  
          </div>
  
          <div className="mt-16 pt-8 border-t border-zinc-800 text-center">
            <a href="/" className="text-amber-500 hover:underline text-sm font-bold">← Kembali ke Beranda</a>
          </div>
  
        </div>
      </div>
    );
  }