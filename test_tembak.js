const https = require('https');

// 👇 KUNCI BARU V2 KAMU
const API_KEY = "os_v2_app_asr75erztbeo3gbmkdluvuxielkngps2un7ek2f2hyy3vm2wvka74u22ixxguulv7beijnupnqnliegy3xu4bt3dldzjrytqhvz6xwq";

const APP_ID = "04a3fe92-3998-48ed-982c-50d74ad2e822";

// 👇 ID LAPTOP KAMU (YANG BENER)
const TARGET_ID = "fca17d83-3410-49b2-b2b6-4348e78fc7cd";

console.log("🚀 TEST TEMBAK PAKE KUNCI V2...");
console.log(`🎯 Target: ${TARGET_ID}`);

const payload = JSON.stringify({
  app_id: APP_ID,
  // TARGETING CARA BARU (KHUSUS KUNCI V2)
  include_aliases: { 
    external_id: [TARGET_ID] 
  },
  target_channel: "push",
  headings: { en: "TES FINAL V2" },
  contents: { en: "Halo bro! Kalau ini masuk, berarti kunci V2 sukses besar!" }
});

const options = {
  hostname: 'api.onesignal.com', // ✅ URL WAJIB BUAT KEY V2
  path: '/notifications',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // ✅ HEADER WAJIB BUAT KEY V2 (Pake 'Key', bukan 'Basic')
    'Authorization': `Key ${API_KEY}`
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`\n📊 STATUS SERVER: ${res.statusCode}`);
    console.log(`📄 RESPON: ${data}`);
    
    if (res.statusCode === 200) {
      console.log("\n✅ SUKSES MUTLAK! Notif pasti nongol.");
    } else {
      console.log("\n❌ MASIH GAGAL. Coba baca error di atas.");
    }
  });
});

req.on('error', e => console.error(`❌ ERROR KONEKSI: ${e.message}`));
req.write(payload);
req.end();