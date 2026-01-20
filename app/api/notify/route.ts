import { NextResponse } from 'next/server';
import https from 'https'; // 👈 KITA PAKE PUSAKA DARI SCRIPT LAPTOP

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment, brand_name, customer_name, phone, owner_id } = body;
    const APP_ID = "04a3fe92-3998-48ed-982c-50d74ad2e822";

    // 👇 KUNCI SAKTI (HARDCODE AJA BIAR AMAN)
    const API_KEY = "os_v2_app_asr75erztbeo3gbmkdluvuxielkngps2un7ek2f2hyy3vm2wvka74u22ixxguulv7beijnupnqnliegy3xu4bt3dldzjrytqhvz6xwq";

    console.log("🚀 [HTTPS NATIVE] MULAI REQUEST...");
    console.log("🎯 TARGET:", owner_id);

    // LOGIKA TITLE & MESSAGE
    const isHappy = rating >= 4;
    const title = isHappy 
        ? `⭐ Review Bintang ${rating} di ${brand_name}!` 
        : `⚠️ Komplain Bintang ${rating} di ${brand_name}`;
    
    const messageContent = `👤 ${customer_name || 'Anonim'} (${phone || '-'})
💬 "${comment || 'Tidak ada komentar'}"`;

    // DATA YANG MAU DIKIRIM
    const payload = JSON.stringify({
      app_id: APP_ID,
      include_aliases: { external_id: [owner_id || "fca17d83-3410-49b2-b2b6-4348e78fc7cd"] }, // Fallback ke ID Laptop kalo kosong
      target_channel: "push",
      headings: { en: title },
      contents: { en: messageContent }
    });

    // 👇 INI BAGIAN PENTING: KITA GAK PAKE FETCH, KITA PAKE HTTPS.REQUEST
    // (PERSIS KAYAK SCRIPT TEST_TEMBAK.JS YANG SUKSES)
    const responseData = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.onesignal.com',
        path: '/notifications',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Key ${API_KEY}` // Header ini terbukti sakti di https module
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
             // Coba parse JSON, kalau bukan JSON balikin text asli
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.write(payload);
      req.end();
    });

    // @ts-ignore
    const { status, body: resultBody } = responseData;

    console.log("✅ STATUS HTTPS:", status);
    console.log("📄 RESPON HTTPS:", JSON.stringify(resultBody));

    if (status !== 200) {
        return NextResponse.json({ success: false, error: resultBody }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: resultBody });

  } catch (error: any) {
    console.error("❌ CRASH HTTPS:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}